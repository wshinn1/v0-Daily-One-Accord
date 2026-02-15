import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

// GET /api/kanban/cards/[cardId] - Get card details
export async function GET(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    console.log("[v0] Fetching card:", cardId)
    const supabase = await getSupabaseServerClient()

    const { data: card, error } = await supabase
      .from("kanban_cards")
      .select(`
        *,
        column:kanban_columns!inner(
          id,
          name,
          board:kanban_boards!inner(id, name)
        )
      `)
      .eq("id", cardId)
      .single()

    if (error) {
      console.error("[v0] Error fetching card:", error)
      captureError(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (card.assigned_to) {
      const { data: assignedUser } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("id", card.assigned_to)
        .single()

      if (assignedUser) {
        card.assigned_user = assignedUser
      }
    }

    console.log("[v0] Card fetched successfully")
    return NextResponse.json(card)
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching card:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/kanban/cards/[cardId] - Update card
export async function PUT(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    console.log("[v0] Updating card:", cardId)
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: card, error } = await supabase
      .from("kanban_cards")
      .update({
        title: body.title,
        description: body.description,
        due_date: body.due_date,
        priority: body.priority,
        labels: body.labels,
        assigned_to: body.assigned_to,
        is_archived: body.is_archived,
        archived_at: body.is_archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating card:", error)
      captureError(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Card updated successfully")
    return NextResponse.json(card)
  } catch (error: any) {
    console.error("[v0] Unexpected error updating card:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/kanban/cards/[cardId] - Delete card
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    console.log("[v0] Deleting card:", cardId)
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from("kanban_cards").delete().eq("id", cardId)

    if (error) {
      console.error("[v0] Error deleting card:", error)
      captureError(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Card deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Unexpected error deleting card:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
