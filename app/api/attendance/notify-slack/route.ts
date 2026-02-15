import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { church_tenant_id, event_id, attendance_count, event_title, event_date } = body

    console.log("[v0] Sending Slack notification for attendance:", {
      church_tenant_id,
      event_id,
      attendance_count,
    })

    // Get Slack integration for this church
    const { data: slackConfig } = await supabase
      .from("slack_integrations")
      .select("*")
      .eq("church_tenant_id", church_tenant_id)
      .maybeSingle()

    if (!slackConfig || !slackConfig.bot_token) {
      console.log("[v0] No Slack integration found for church")
      return NextResponse.json({ message: "No Slack integration configured" }, { status: 200 })
    }

    // Get synced channels for this church
    const { data: channels } = await supabase
      .from("slack_channels")
      .select("*")
      .eq("church_tenant_id", church_tenant_id)
      .eq("is_synced", true)

    if (!channels || channels.length === 0) {
      console.log("[v0] No synced Slack channels found")
      return NextResponse.json({ message: "No synced Slack channels" }, { status: 200 })
    }

    // Send notification to each synced channel
    const results = await Promise.all(
      channels.map(async (channel) => {
        try {
          const response = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${slackConfig.bot_token}`,
            },
            body: JSON.stringify({
              channel: channel.channel_id,
              text: `📊 Attendance Update: ${event_title}`,
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: "📊 Church Service Attendance",
                  },
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*Event:*\n${event_title}`,
                    },
                    {
                      type: "mrkdwn",
                      text: `*Date:*\n${event_date}`,
                    },
                    {
                      type: "mrkdwn",
                      text: `*Attendance:*\n${attendance_count} people`,
                    },
                  ],
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: `Updated at ${new Date().toLocaleString()}`,
                    },
                  ],
                },
              ],
            }),
          })

          const data = await response.json()
          console.log("[v0] Slack API response:", data)

          if (!data.ok) {
            console.error("[v0] Slack API error:", data.error)
            return { channel: channel.channel_name, success: false, error: data.error }
          }

          return { channel: channel.channel_name, success: true }
        } catch (error) {
          console.error("[v0] Error sending to channel:", channel.channel_name, error)
          return { channel: channel.channel_name, success: false, error: String(error) }
        }
      }),
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Error in notify-slack route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
