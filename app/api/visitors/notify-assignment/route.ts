import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Visitor assignment notification API called")

    const body = await request.json()
    const { tenantId, visitorId, visitorName, assignedToId, assignedToName } = body

    if (!tenantId || !visitorId || !assignedToId) {
      console.log("[v0] Missing required fields:", { tenantId, visitorId, assignedToId })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get Slack integration for this tenant
    const { data: slackConfig, error: configError } = await supabase
      .from("slack_integrations")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .eq("is_active", true)
      .single()

    if (configError || !slackConfig) {
      console.log("[v0] No active Slack integration found for tenant:", tenantId)
      return NextResponse.json({ success: true, skipped: true, reason: "Slack not configured" })
    }

    // Get the assigned user's Slack user ID from church_members table
    const { data: churchMember } = await supabase
      .from("church_members")
      .select("slack_user_id")
      .eq("user_id", assignedToId)
      .eq("church_tenant_id", tenantId)
      .maybeSingle()

    console.log("[v0] Church member Slack info:", churchMember)

    // Build the message
    const message = `👤 *New Visitor Assigned to You*\n\n*Visitor:* ${visitorName}\n*Assigned by:* System\n\nPlease follow up with this visitor soon!`

    // Send DM to the assigned user if we have their Slack user ID
    if (churchMember?.slack_user_id && slackConfig.bot_token) {
      console.log("[v0] Sending DM to Slack user:", churchMember.slack_user_id)

      const dmResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackConfig.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: churchMember.slack_user_id,
          text: message,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Visitor Pipeline",
                  },
                  url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/visitors`,
                  style: "primary",
                },
              ],
            },
          ],
        }),
      })

      const dmData = await dmResponse.json()
      console.log("[v0] Slack DM response:", dmData)

      if (!dmData.ok) {
        console.error("[v0] Failed to send Slack DM:", dmData.error)
      } else {
        console.log("[v0] Slack DM sent successfully")
      }
    } else {
      console.log("[v0] No Slack user ID found or bot token missing, skipping DM")
    }

    // Also post to a general channel if configured
    const notificationSettings = slackConfig.notification_settings || {}
    const visitorSettings = notificationSettings.new_visitor

    if (visitorSettings?.enabled && visitorSettings?.channel_id) {
      console.log("[v0] Posting to channel:", visitorSettings.channel_id)

      const channelMessage = `👤 *Visitor Assigned*\n\n*Visitor:* ${visitorName}\n*Assigned to:* ${assignedToName}`

      const channelResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackConfig.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: visitorSettings.channel_id,
          text: channelMessage,
        }),
      })

      const channelData = await channelResponse.json()
      console.log("[v0] Channel post response:", channelData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in visitor assignment notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
