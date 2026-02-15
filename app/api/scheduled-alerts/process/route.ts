import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client"

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceRoleClient()

    // Get all active alerts that are due
    const now = new Date().toISOString()
    const { data: alerts, error } = await supabase
      .from("scheduled_alerts")
      .select(
        `
        *,
        church:church_tenants(id, name, slack_bot_token)
      `,
      )
      .eq("is_active", true)
      .lte("next_run_at", now)

    if (error) throw error

    console.log(`[v0] Processing ${alerts?.length || 0} scheduled alerts`)

    for (const alert of alerts || []) {
      try {
        // Send Slack message
        await sendSlackAlert(alert)

        // Calculate next run time
        const nextRun = calculateNextRun(alert)

        // Update alert
        await supabase
          .from("scheduled_alerts")
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun,
          })
          .eq("id", alert.id)

        // Log success
        await supabase.from("alert_logs").insert({
          alert_id: alert.id,
          success: true,
        })

        console.log(`[v0] Alert ${alert.id} sent successfully`)
      } catch (error: any) {
        console.error(`[v0] Error processing alert ${alert.id}:`, error)

        // Log failure
        await supabase.from("alert_logs").insert({
          alert_id: alert.id,
          success: false,
          error_message: error.message,
        })
      }
    }

    return NextResponse.json({ processed: alerts?.length || 0 })
  } catch (error: any) {
    console.error("[v0] Error processing alerts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function sendSlackAlert(alert: any) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${alert.church.slack_bot_token}`,
    },
    body: JSON.stringify({
      channel: alert.channel_id,
      text: alert.message,
    }),
  })

  const result = await response.json()
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`)
  }
}

function calculateNextRun(alert: any): string {
  const now = new Date()
  const [hours, minutes] = alert.schedule_time.split(":")
  const nextRun = new Date()
  nextRun.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

  switch (alert.schedule_type) {
    case "once":
      return alert.next_run_at // Don't reschedule one-time alerts
    case "daily":
      nextRun.setDate(nextRun.getDate() + 1)
      break
    case "weekly":
      nextRun.setDate(nextRun.getDate() + 7)
      break
    case "monthly":
      nextRun.setMonth(nextRun.getMonth() + 1)
      break
  }

  return nextRun.toISOString()
}
