import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/kanban/boards/[boardId]/slack-settings - Get Slack settings for a board
export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    console.log("[v0] Fetching Slack settings for board:", params.boardId)
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from("kanban_board_slack_settings")
      .select("*")
      .eq("board_id", params.boardId)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching Slack settings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Slack settings fetched:", data ? "found" : "not found")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching Slack settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/kanban/boards/[boardId]/slack-settings - Create or update Slack settings
export async function POST(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    console.log("[v0] Saving Slack settings for board:", params.boardId)
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("kanban_board_slack_settings")
      .upsert(
        {
          board_id: params.boardId,
          channel_id: body.channel_id,
          channel_name: body.channel_name,
          notify_on_card_created: body.notify_on_card_created,
          notify_on_card_moved: body.notify_on_card_moved,
          notify_on_card_assigned: body.notify_on_card_assigned,
          notify_on_comment_added: body.notify_on_comment_added,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "board_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving Slack settings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Slack settings saved successfully")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Unexpected error saving Slack settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
