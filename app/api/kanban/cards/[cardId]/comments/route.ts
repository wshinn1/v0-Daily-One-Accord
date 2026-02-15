import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

// GET /api/kanban/cards/[cardId]/comments - Get all comments for a card
export async function GET(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    const { cardId } = params
    console.log("[v0] Fetching comments for card:", cardId)
    const supabase = await getSupabaseServerClient()

    const { data: comments, error } = await supabase
      .from("kanban_card_comments")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching comments:", error)
      captureError(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const commentsWithUsers = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: user } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", comment.user_id)
          .single()

        return {
          ...comment,
          user: user || null,
        }
      }),
    )

    console.log("[v0] Comments fetched successfully:", commentsWithUsers.length)
    return NextResponse.json(commentsWithUsers)
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching comments:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/kanban/cards/[cardId]/comments - Create a new comment
export async function POST(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    const { cardId } = params
    console.log("[v0] Creating comment for card:", cardId)
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: comment, error } = await supabase
      .from("kanban_card_comments")
      .insert({
        card_id: cardId,
        user_id: user.id,
        content: body.content,
        mentions: body.mentions || [],
      })
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Error creating comment:", error)
      captureError(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create activity log entry
    await supabase.from("kanban_card_activities").insert({
      card_id: cardId,
      user_id: user.id,
      activity_type: "commented",
      activity_data: { comment_id: comment.id },
    })

    console.log("[v0] Comment created successfully:", comment.id)
    return NextResponse.json(comment)
  } catch (error: any) {
    console.error("[v0] Unexpected error creating comment:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
