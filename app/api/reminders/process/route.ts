import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceRoleClient()

    // Get all pending reminders that are due
    const now = new Date().toISOString()
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(
        `
        *,
        card:kanban_cards(id, title, description, board_id),
        user:users(id, full_name, email, slack_user_id),
        church:church_tenants(id, name, slack_bot_token)
      `,
      )
      .eq("is_sent", false)
      .lte("reminder_time", now)

    if (error) throw error

    console.log(`[v0] Processing ${reminders?.length || 0} reminders`)

    for (const reminder of reminders || []) {
      try {
        // Send Slack notification
        if (reminder.notification_channels.includes("slack") && reminder.church.slack_bot_token) {
          await sendSlackReminder(reminder)
        }

        // Send email notification
        if (reminder.notification_channels.includes("email")) {
          await sendEmailReminder(reminder)
        }

        // Mark as sent
        await supabase
          .from("reminders")
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq("id", reminder.id)

        console.log(`[v0] Reminder ${reminder.id} sent successfully`)
      } catch (error) {
        console.error(`[v0] Error processing reminder ${reminder.id}:`, error)
      }
    }

    return NextResponse.json({ processed: reminders?.length || 0 })
  } catch (error: any) {
    console.error("[v0] Error processing reminders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function sendSlackReminder(reminder: any) {
  const cardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/unity/${reminder.card.board_id}`
  const message = reminder.message || `Reminder: Follow up on "${reminder.card.title}"`

  const slackMessage = {
    channel: reminder.user.slack_user_id ? `@${reminder.user.slack_user_id}` : "#general",
    text: `🔔 *Kanban Card Reminder*`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🔔 Kanban Card Reminder",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Card:* ${reminder.card.title}\n*Message:* ${message}\n\n<@${reminder.user.slack_user_id}> - Time to follow up!`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Card",
            },
            url: cardUrl,
            style: "primary",
          },
        ],
      },
    ],
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${reminder.church.slack_bot_token}`,
    },
    body: JSON.stringify(slackMessage),
  })

  const result = await response.json()
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`)
  }
}

async function sendEmailReminder(reminder: any) {
  // TODO: Implement email sending via Resend
  console.log(`[v0] Email reminder for ${reminder.user.email}`)
}
