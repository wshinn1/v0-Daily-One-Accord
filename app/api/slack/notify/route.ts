import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  console.log("[v0] ========================================")
  console.log("[v0] SLACK NOTIFY API CALLED")
  console.log("[v0] ========================================")

  const body = await request.json()
  const { tenantId, eventType, data } = body

  console.log("[v0] Request body:", JSON.stringify(body, null, 2))
  console.log("[v0] Tenant ID:", tenantId)
  console.log("[v0] Event type:", eventType)
  console.log("[v0] Data:", JSON.stringify(data, null, 2))

  if (!tenantId || !eventType) {
    console.error("[v0] ❌ Validation failed - missing required fields")
    console.error("[v0] tenantId present:", !!tenantId)
    console.error("[v0] eventType present:", !!eventType)
    throw new ValidationError("Missing required fields")
  }

  const supabase = await getSupabaseServiceRoleClient()

  // ----- FETCHING SLACK CONFIGURATION -----
  console.log("[v0] Querying slack_integrations table for tenant:", tenantId)

  const { data: slackConfig, error: configError } = await supabase
    .from("slack_integrations")
    .select("*")
    .eq("church_tenant_id", tenantId)
    .eq("is_active", true)
    .maybeSingle()

  if (configError) {
    console.error("[v0] ❌ Database error fetching Slack config:", configError)
    console.error("[v0] Error code:", configError.code)
    console.error("[v0] Error message:", configError.message)
    console.error("[v0] Error details:", configError.details)
    throw new DatabaseError("Failed to fetch Slack configuration", { error: configError })
  }

  if (!slackConfig) {
    console.log("[v0] ⚠️ No active Slack integration found for tenant:", tenantId)
    console.log("[v0] This means either:")
    console.log("[v0]   1. Slack is not connected for this tenant")
    console.log("[v0]   2. The integration is not marked as active")
    console.log("[v0] To set up Slack: Go to Dashboard → Slack → Integration")
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Slack integration not configured. Please set up Slack in Dashboard → Slack → Integration.",
    })
  }

  // ----- FETCHING SLACK CHANNELS -----
  console.log("[v0] Querying slack_channels for integration:", slackConfig.id)
  const { data: slackChannels, error: channelsError } = await supabase
    .from("slack_channels")
    .select("*")
    .eq("slack_integration_id", slackConfig.id)

  if (channelsError) {
    console.error("[v0] ❌ Database error fetching Slack channels:", channelsError)
  }

  slackConfig.slack_channels = slackChannels || []

  console.log("[v0] ✅ Slack config found")
  console.log("[v0] Config details:")
  console.log("[v0]   - Has webhook URL:", !!slackConfig.webhook_url)
  console.log("[v0]   - Has bot token:", !!slackConfig.bot_token)
  console.log("[v0]   - Workspace ID:", slackConfig.workspace_id)
  console.log("[v0]   - Team name:", slackConfig.team_name)
  console.log("[v0]   - Channels count:", slackConfig.slack_channels?.length || 0)
  console.log("[v0]   - Notification settings:", JSON.stringify(slackConfig.notification_settings, null, 2))

  // ----- CHECKING NOTIFICATION SETTINGS -----
  console.log("[v0] All notification settings:", JSON.stringify(slackConfig.notification_settings, null, 2))

  const notificationSettings = slackConfig.notification_settings || {}
  let eventSettings = notificationSettings[eventType]
  let channelId: string | undefined

  // Handle backward compatibility for visitor_comment_mention
  if (eventType === "visitor_comment_mention") {
    console.log("[v0] Checking for visitor_comment_mention settings...")

    // Check new format first: visitor_comment_mention: { enabled: true, channel_id: "..." }
    if (eventSettings && typeof eventSettings === "object" && "channel_id" in eventSettings) {
      console.log("[v0] Found new format: visitor_comment_mention object")
      channelId = eventSettings.channel_id
    }
    // Check old format: visitor_comment_channel: "channel-id-string"
    else if (notificationSettings.visitor_comment_channel) {
      console.log("[v0] Found old format: visitor_comment_channel string")
      channelId = notificationSettings.visitor_comment_channel
      // Create a synthetic eventSettings object for backward compatibility
      eventSettings = {
        enabled: true,
        channel_id: channelId,
      }
    }

    console.log("[v0] Resolved channel ID:", channelId)
  }

  console.log("[v0] Settings for event type '" + eventType + "':", JSON.stringify(eventSettings, null, 2))

  if (!eventSettings) {
    console.log("[v0] ⚠️ No settings found for event type:", eventType)
    console.log("[v0] Available event types:", Object.keys(notificationSettings))
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: `No settings configured for event type: ${eventType}`,
    })
  }

  if (!eventSettings.enabled) {
    console.log("[v0] ⚠️ Notifications disabled for event type:", eventType)
    console.log("[v0] To enable: Go to Dashboard → Slack → Notifications")
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: `Notifications not enabled for ${eventType}`,
    })
  }

  console.log("[v0] ✅ Notifications enabled for event type:", eventType)

  // ----- FINDING TARGET CHANNEL -----
  // Use the channelId we resolved earlier for visitor_comment_mention, otherwise use eventSettings.channel_id
  const targetChannelId = channelId || eventSettings.channel_id

  console.log("[v0] Looking for channel ID:", targetChannelId)
  console.log(
    "[v0] Available channels:",
    slackConfig.slack_channels?.map((ch: any) => ({
      id: ch.id,
      channel_id: ch.channel_id,
      channel_name: ch.channel_name,
    })),
  )

  const channel = slackConfig.slack_channels?.find((ch: any) => ch.id === targetChannelId)

  if (!channel) {
    console.error("[v0] ❌ Channel not found with ID:", targetChannelId)
    console.log("[v0] This means the channel was deleted or the setting is outdated")
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Configured channel not found",
    })
  }

  console.log("[v0] ✅ Target channel found:")
  console.log("[v0]   - Channel ID:", channel.channel_id)
  console.log("[v0]   - Channel name:", channel.channel_name)

  // ----- BUILDING MESSAGE -----
  console.log("[v0] ----- BUILDING MESSAGE -----")
  let message = ""
  switch (eventType) {
    case "new_visitor":
      message = `🎉 *New Visitor Added*\n\n*Name:* ${data.full_name}\n`
      if (data.email) message += `*Email:* ${data.email}\n`
      if (data.phone) message += `*Phone:* ${data.phone}\n`
      if (data.notes) message += `*Notes:* ${data.notes}`
      break
    case "visitor_status_changed":
      message = `🔄 *Visitor Status Changed*\n\n*Visitor:* ${data.visitor_name}\n*From:* ${data.old_status}\n*To:* ${data.new_status}`
      if (data.visitor_email) message += `\n*Email:* ${data.visitor_email}`
      if (data.visitor_phone) message += `\n*Phone:* ${data.visitor_phone}`
      break
    case "visitor_comment_mention":
      const mentionedUsers =
        typeof data.mentioned_users === "string"
          ? data.mentioned_users
          : Array.isArray(data.mentioned_users)
            ? data.mentioned_users.join(", ")
            : "Unknown"

      message = `💬 *You were mentioned in a comment*\n\n*Visitor:* ${data.visitor_name}\n*By:* ${data.commenter_name}\n*Mentioned:* ${mentionedUsers}\n\n*Comment:*\n${data.comment_text}`
      break
    case "event_registration":
      message = `📅 *New Event Registration*\n\n*Event:* ${data.event_name}\n*Attendee:* ${data.attendee_name}\n${data.email ? `*Email:* ${data.email}` : ""}`
      break
    case "new_volunteer":
      message = `🙌 *New Volunteer*\n\n*Name:* ${data.volunteer_name}\n*Team:* ${data.team_name}`
      break
    case "new_user_signup":
      message = `👋 *New User Signed Up*\n\n*Name:* ${data.full_name}\n*Email:* ${data.email}\n*Church:* ${data.church_name}\n*Role:* ${data.role || "Member"}`
      break
    default:
      message = `New ${eventType} event`
  }

  console.log("[v0] Message to send:")
  console.log("[v0] " + message.replace(/\n/g, "\n[v0] "))

  // ----- SENDING VIA WEBHOOK -----
  let sentViaWebhook = false
  let sentViaBot = false

  if (slackConfig.webhook_url) {
    console.log("[v0] Webhook URL:", slackConfig.webhook_url.substring(0, 50) + "...")
    try {
      const webhookPayload = {
        text: message,
        channel: channel.channel_id,
      }
      console.log("[v0] Webhook payload:", JSON.stringify(webhookPayload, null, 2))

      const webhookResponse = await fetch(slackConfig.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })

      const responseText = await webhookResponse.text()
      console.log("[v0] Webhook response status:", webhookResponse.status)
      console.log("[v0] Webhook response text:", responseText)

      if (!webhookResponse.ok) {
        console.error("[v0] Webhook failed with status:", webhookResponse.status)
        console.error("[v0] Response:", responseText)
      } else {
        console.log("[v0] Webhook sent successfully")
        sentViaWebhook = true
      }
    } catch (error) {
      console.error("[v0] Webhook exception:", error)
      if (error instanceof Error) {
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }
    }
  } else {
    console.log("[v0] ⚠️ No webhook URL configured")
  }

  // ----- SENDING VIA BOT TOKEN -----
  if (slackConfig.bot_token) {
    console.log("[v0] Bot token:", slackConfig.bot_token.substring(0, 20) + "...")
    try {
      const botPayload = {
        channel: channel.channel_id,
        text: message,
      }
      console.log("[v0] Bot API payload:", JSON.stringify(botPayload, null, 2))

      const botResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackConfig.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(botPayload),
      })

      const botData = await botResponse.json()
      console.log("[v0] Bot API response:", JSON.stringify(botData, null, 2))

      if (!botData.ok) {
        console.error("[v0] Bot API failed with error:", botData.error)
        console.error("[v0] Full response:", botData)
      } else {
        console.log("[v0] Bot API sent successfully")
        console.log("[v0] Message timestamp:", botData.ts)
        sentViaBot = true
      }
    } catch (error) {
      console.error("[v0] Bot API exception:", error)
      if (error instanceof Error) {
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }
    }
  } else {
    console.log("[v0] ⚠️ No bot token configured")
  }

  console.log("[v0] ========================================")
  console.log("[v0] SLACK NOTIFY COMPLETE")
  console.log("[v0] Sent via webhook:", sentViaWebhook)
  console.log("[v0] Sent via bot:", sentViaBot)
  console.log("[v0] ========================================")

  if (!sentViaWebhook && !sentViaBot) {
    throw new ExternalAPIError("Failed to send Slack notification via any method")
  }

  return NextResponse.json({ success: true })
})
