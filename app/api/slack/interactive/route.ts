import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { verifySlackRequest } from "@/lib/slack-verify"
import { AuthenticationError, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Slack interactive request received")

    const body = await request.text()
    const payload = JSON.parse(new URLSearchParams(body).get("payload") || "{}")
    const teamId = payload.team.id

    console.log("[v0] Team ID:", teamId)
    console.log("[v0] Payload type:", payload.type)

    const supabase = getSupabaseServiceRole()

    const { data: botConfig } = await supabase
      .from("slack_bot_configs")
      .select("signing_secret, bot_token")
      .eq("team_id", teamId)
      .single()

    console.log("[v0] Bot config found:", !!botConfig)

    if (!botConfig) {
      console.error("[v0] Bot not configured for team:", teamId)
      throw new AuthenticationError("Bot not configured for this team")
    }

    const timestamp = request.headers.get("x-slack-request-timestamp") || ""
    const signature = request.headers.get("x-slack-signature") || ""

    if (!verifySlackRequest(body, timestamp, signature, botConfig.signing_secret)) {
      console.error("[v0] Invalid Slack signature")
      throw new AuthenticationError("Invalid Slack signature")
    }

    if (payload.type === "url_verification") {
      return NextResponse.json({ challenge: payload.challenge })
    }

    if (payload.type === "view_submission") {
      console.log("[v0] Processing view submission")

      const values = payload.view.state.values
      const eventId = values.event_block.event_select.selected_option.value
      const attendanceDate = values.date_block.date_select.selected_date
      const notes = values.notes_block?.notes_input?.value || null

      console.log("[v0] Submission data:", { eventId, attendanceDate, notes })

      const { data: workspace, error: workspaceError } = await supabase
        .from("slack_workspaces")
        .select("church_tenant_id")
        .eq("team_id", teamId)
        .single()

      console.log("[v0] Workspace lookup:", { found: !!workspace, error: workspaceError })

      if (!workspace) {
        console.error("[v0] Workspace not found for team:", teamId)
        throw new ValidationError("Slack workspace not configured")
      }

      const { data: categories, error: categoriesError } = await supabase
        .from("attendance_categories")
        .select("id, name")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .eq("is_active", true)

      console.log("[v0] Categories found:", categories?.length || 0, "Error:", categoriesError)

      const { data: customFields } = await supabase
        .from("slack_attendance_form_fields")
        .select("*")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .eq("is_active", true)

      const customFieldValues: Record<string, any> = {}
      if (customFields) {
        customFields.forEach((field) => {
          const blockId = `custom_${field.id}`
          const actionId = `custom_input_${field.id}`
          const value =
            values[blockId]?.[actionId]?.value ||
            values[blockId]?.[actionId]?.selected_option?.value ||
            values[blockId]?.[actionId]?.selected_date
          if (value) {
            customFieldValues[field.field_name] = value
          }
        })
      }

      const categoryRecords: any[] = []
      let totalCount = 0

      if (categories) {
        for (const category of categories) {
          const blockId = `category_${category.id}`
          const actionId = `count_${category.id}`
          const rawValue = values[blockId]?.[actionId]?.value
          const count = typeof rawValue === "number" ? rawValue : Number(rawValue || 0)

          console.log("[v0] Category:", category.name, "Count:", count)

          if (count > 0) {
            categoryRecords.push({
              church_tenant_id: workspace.church_tenant_id,
              event_id: eventId,
              category_id: category.id,
              count: count,
              notes: notes,
              recorded_at: new Date(attendanceDate).toISOString(),
              custom_fields: customFieldValues,
            })
            totalCount += count
          }
        }
      }

      console.log("[v0] Total records to insert:", categoryRecords.length, "Total count:", totalCount)

      if (categoryRecords.length === 0) {
        console.log("[v0] No attendance counts entered")
        throw new ValidationError("Please enter at least one attendance count")
      }

      const { error: insertError } = await supabase.from("attendance_by_category").insert(categoryRecords)

      if (insertError) {
        console.error("[v0] Error inserting attendance:", insertError)
        throw new DatabaseError("Failed to save attendance", { error: insertError })
      }

      console.log("[v0] Attendance saved successfully")

      const { data: event } = await supabase.from("events").select("title, event_type").eq("id", eventId).single()

      const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${botConfig.bot_token}`,
        },
        body: JSON.stringify({
          channel: payload.user.id,
          text: `✅ Attendance logged: ${totalCount} total people at ${event?.title || "the event"} (${event?.event_type || "service"}) on ${new Date(attendanceDate).toLocaleDateString()}`,
        }),
      })

      if (!slackResponse.ok) {
        throw new ExternalAPIError("Failed to send Slack confirmation message")
      }

      console.log("[v0] Success message sent to user")

      return NextResponse.json({ response_action: "clear" })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Slack interactive error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
