import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, ExternalAPIError, DatabaseError } from "@/lib/errors/handler"

// This endpoint handles Slack messages and bridges them to GroupMe
export const POST = asyncHandler(async (request: NextRequest) => {
  const body = await request.json()

  // Handle Slack URL verification
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge })
  }

  // Only process message events
  if (body.type !== "event_callback" || body.event?.type !== "message") {
    return NextResponse.json({ success: true })
  }

  const event = body.event

  // Ignore bot messages and message changes to prevent loops
  if (event.bot_id || event.subtype === "message_changed" || event.subtype === "message_deleted") {
    return NextResponse.json({ success: true, skipped: "bot_or_edit" })
  }

  const supabase = await createClient()

  // Find bridge configurations for this Slack channel
  const { data: bridges, error: bridgesError } = await supabase
    .from("message_bridges")
    .select(`
      *,
      groupme_bots!inner(bot_id, bot_token, group_id)
    `)
    .eq("slack_channel_id", event.channel)
    .eq("enabled", true)
    .in("sync_direction", ["slack_to_groupme", "bidirectional"])

  if (bridgesError) {
    throw new DatabaseError("Failed to fetch message bridges", { error: bridgesError })
  }

  if (!bridges || bridges.length === 0) {
    return NextResponse.json({ success: true, skipped: "no_bridge_configured" })
  }

  for (const bridge of bridges) {
    // Check if this message was already bridged (prevent loop)
    const { data: existingBridge } = await supabase
      .from("bridged_messages")
      .select("id")
      .eq("bridge_id", bridge.id)
      .eq("source_platform", "slack")
      .eq("source_message_id", event.ts)
      .maybeSingle()

    if (existingBridge) {
      continue // Skip if already bridged
    }

    // Get user info from Slack if we want to include sender name
    let senderName = "Someone"
    if (bridge.include_sender_name && event.user) {
      const userResponse = await fetch(`https://slack.com/api/users.info?user=${event.user}`, {
        headers: {
          Authorization: `Bearer ${body.authorizations?.[0]?.token || process.env.SLACK_BOT_TOKEN}`,
        },
      })
      const userData = await userResponse.json()
      if (!userData.ok) {
        throw new ExternalAPIError("Failed to fetch Slack user info", { error: userData.error })
      }
      if (userData.ok) {
        senderName = userData.user.real_name || userData.user.name
      }
    }

    // Format message for GroupMe
    let messageText = event.text || ""
    if (bridge.include_sender_name) {
      messageText = `[Slack] ${senderName}: ${messageText}`
    }

    // Send message to GroupMe
    const groupmeResponse = await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: bridge.groupme_bots.bot_id,
        text: messageText,
      }),
    })

    if (!groupmeResponse.ok) {
      throw new ExternalAPIError("Failed to send message to GroupMe", {
        status: groupmeResponse.status,
      })
    }

    // Record the bridged message
    const { error: insertError } = await supabase.from("bridged_messages").insert({
      bridge_id: bridge.id,
      source_platform: "slack",
      source_message_id: event.ts,
      source_user_id: event.user,
      source_user_name: senderName,
      dest_platform: "groupme",
      dest_message_id: null, // GroupMe doesn't return message ID for bot posts
      message_text: event.text,
      has_attachments: !!(event.files && event.files.length > 0),
    })

    if (insertError) {
      throw new DatabaseError("Failed to record bridged message", { error: insertError })
    }
  }

  return NextResponse.json({ success: true })
})
