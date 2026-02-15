import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle URL verification challenge from Slack
    if (body.type === "url_verification") {
      return NextResponse.json({ challenge: body.challenge })
    }

    // Handle actual events
    if (body.type === "event_callback") {
      const event = body.event

      // Get the team_id from the body
      const teamId = body.team_id

      // Get church info from Supabase
      const supabase = await createClient()
      const { data: church } = await supabase.from("churches").select("id").eq("slack_team_id", teamId).single()

      if (!church) {
        console.error("[v0] Church not found for team_id:", teamId)
        return NextResponse.json({ ok: true }) // Still return 200 to Slack
      }

      // Handle different event types
      switch (event.type) {
        case "app_mention":
          console.log("[v0] App mentioned:", event)
          // Handle app mentions if needed
          break

        case "message":
          console.log("[v0] Message received:", event)
          // Handle messages if needed
          break

        case "member_joined_channel":
          console.log("[v0] Member joined channel:", event)
          // Handle member joins if needed
          break

        case "member_left_channel":
          console.log("[v0] Member left channel:", event)
          // Handle member leaves if needed
          break

        default:
          console.log("[v0] Unhandled event type:", event.type)
      }
    }

    // Always return 200 OK to Slack
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error handling Slack event:", error)
    // Still return 200 to prevent Slack from retrying
    return NextResponse.json({ ok: true })
  }
}
