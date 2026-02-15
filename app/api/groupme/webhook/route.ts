import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const body = await request.json()

  // GroupMe sends a verification request when setting up webhooks
  if (body.name === "system" && body.text === "ping") {
    return NextResponse.json({ success: true })
  }

  // Ignore messages from bots to prevent loops
  if (body.sender_type === "bot") {
    return NextResponse.json({ success: true, skipped: "bot_message" })
  }

  const supabase = await createClient()

  // Find the bridge configuration for this GroupMe group
  const { data: bridges, error: bridgeError } = await supabase
    .from("message_bridges")
    .select(`
      *,
      groupme_bots!inner(bot_id, group_id, church_tenant_id),
      slack_workspaces!inner(bot_token)
    `)
    .eq("groupme_group_id", body.group_id)
    .eq("enabled", true)
    .in("sync_direction", ["groupme_to_slack", "bidirectional"])

  if (bridgeError) {
    throw new DatabaseError("Failed to fetch bridge configuration", { originalError: bridgeError })
  }

  if (!bridges || bridges.length === 0) {
    return NextResponse.json({ success: true, skipped: "no_bridge_configured" })
  }

  for (const bridge of bridges) {
    // Check if this message was already bridged (prevent loop)
    const { data: existingBridge, error: checkError } = await supabase
      .from("bridged_messages")
      .select("id")
      .eq("bridge_id", bridge.id)
      .eq("source_platform", "groupme")
      .eq("source_message_id", body.id)
      .maybeSingle()

    if (checkError) {
      throw new DatabaseError("Failed to check for existing bridged message", { originalError: checkError })
    }

    if (existingBridge) {
      continue // Skip if already bridged
    }

    // Format message for Slack
    let messageText = body.text || ""
    if (bridge.include_sender_name) {
      messageText = `[GroupMe] ${body.name}: ${messageText}`
    }

    // Send message to Slack
    const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.slack_workspaces.bot_token}`,
      },
      body: JSON.stringify({
        channel: bridge.slack_channel_id,
        text: messageText,
        unfurl_links: false,
        unfurl_media: false,
      }),
    })

    const slackData = await slackResponse.json()

    if (!slackData.ok) {
      throw new ExternalAPIError("Failed to send message to Slack", {
        service: "Slack",
        statusCode: slackResponse.status,
        responseData: slackData,
      })
    }

    // Record the bridged message
    const { error: insertError } = await supabase.from("bridged_messages").insert({
      bridge_id: bridge.id,
      source_platform: "groupme",
      source_message_id: body.id,
      source_user_id: body.user_id,
      source_user_name: body.name,
      dest_platform: "slack",
      dest_message_id: slackData.ts,
      message_text: body.text,
      has_attachments: !!(body.attachments && body.attachments.length > 0),
    })

    if (insertError) {
      throw new DatabaseError("Failed to record bridged message", { originalError: insertError })
    }
  }

  return NextResponse.json({ success: true })
})
