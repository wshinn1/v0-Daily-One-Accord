import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// PUT /api/kanban/cards/[cardId]/comments/[commentId] - Update a comment
export async function PUT(request: NextRequest, { params }: { params: { cardId: string; commentId: string } }) {
  try {
    console.log("[v0] Updating comment:", params.commentId)
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const { data: comment, error } = await supabase
      .from("kanban_card_comments")
      .update({
        content: body.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.commentId)
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating comment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Comment updated successfully")
    return NextResponse.json(comment)
  } catch (error: any) {
    console.error("[v0] Unexpected error updating comment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/kanban/cards/[cardId]/comments/[commentId] - Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: { cardId: string; commentId: string } }) {
  try {
    console.log("[v0] Deleting comment:", params.commentId)
    const supabase = getSupabaseServerClient()

    const { error } = await supabase.from("kanban_card_comments").delete().eq("id", params.commentId)

    if (error) {
      console.error("[v0] Error deleting comment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Comment deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Unexpected error deleting comment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
