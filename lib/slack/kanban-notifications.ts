import { getSupabaseServerClient } from "@/lib/supabase/server"

interface KanbanNotificationData {
  churchTenantId: string
  eventType: "card_created" | "card_moved" | "card_assigned" | "card_completed" | "card_commented"
  cardTitle: string
  cardDescription?: string
  boardName: string
  columnName?: string
  previousColumnName?: string
  assignedToName?: string
  assignedByName?: string
  actorName: string
  cardUrl?: string
}

export async function sendKanbanSlackNotification(data: KanbanNotificationData) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get Slack integration for this church
    const { data: slackConfig, error: configError } = await supabase
      .from("slack_integrations")
      .select("*, slack_channels(*)")
      .eq("church_tenant_id", data.churchTenantId)
      .eq("is_active", true)
      .maybeSingle()

    if (configError || !slackConfig) {
      console.log("[v0] No active Slack integration found for kanban notifications")
      return { success: false, reason: "no_integration" }
    }

    // Check if kanban notifications are enabled
    const notificationSettings = slackConfig.notification_settings || {}
    const kanbanSettings = notificationSettings.kanban

    if (!kanbanSettings || !kanbanSettings.enabled) {
      console.log("[v0] Kanban notifications not enabled")
      return { success: false, reason: "not_enabled" }
    }

    // Find the channel to send to
    const channelId = kanbanSettings.channel_id
    const channel = slackConfig.slack_channels?.find((ch: any) => ch.id === channelId)

    if (!channel) {
      console.log("[v0] No channel configured for kanban notifications")
      return { success: false, reason: "no_channel" }
    }

    // Build message based on event type
    let message = ""
    let emoji = ""

    switch (data.eventType) {
      case "card_created":
        emoji = "✨"
        message = `${emoji} *New Card Created*\n\n*Board:* ${data.boardName}\n*Card:* ${data.cardTitle}\n*Column:* ${data.columnName}\n*Created by:* ${data.actorName}`
        if (data.cardDescription) {
          message += `\n*Description:* ${data.cardDescription.substring(0, 100)}${data.cardDescription.length > 100 ? "..." : ""}`
        }
        break

      case "card_moved":
        emoji = "🔄"
        message = `${emoji} *Card Moved*\n\n*Board:* ${data.boardName}\n*Card:* ${data.cardTitle}\n*From:* ${data.previousColumnName} → *To:* ${data.columnName}\n*Moved by:* ${data.actorName}`
        break

      case "card_assigned":
        emoji = "👤"
        message = `${emoji} *Card Assigned*\n\n*Board:* ${data.boardName}\n*Card:* ${data.cardTitle}\n*Assigned to:* ${data.assignedToName}\n*Assigned by:* ${data.assignedByName}`
        break

      case "card_completed":
        emoji = "✅"
        message = `${emoji} *Card Completed*\n\n*Board:* ${data.boardName}\n*Card:* ${data.cardTitle}\n*Completed by:* ${data.actorName}`
        break

      case "card_commented":
        emoji = "💬"
        message = `${emoji} *New Comment*\n\n*Board:* ${data.boardName}\n*Card:* ${data.cardTitle}\n*Comment by:* ${data.actorName}`
        break
    }

    // Send using bot token
    if (slackConfig.bot_token) {
      const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackConfig.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: channel.channel_id,
          text: message,
          unfurl_links: false,
          unfurl_media: false,
        }),
      })

      const result = await response.json()

      if (!result.ok) {
        console.error("[v0] Slack API error:", result.error)
        return { success: false, reason: "api_error", error: result.error }
      }

      console.log("[v0] Kanban Slack notification sent successfully")
      return { success: true }
    }

    return { success: false, reason: "no_bot_token" }
  } catch (error) {
    console.error("[v0] Error sending kanban Slack notification:", error)
    return { success: false, reason: "exception", error }
  }
}
