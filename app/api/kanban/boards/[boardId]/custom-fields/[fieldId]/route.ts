import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { boardId: string; fieldId: string } }) {
  try {
    console.log("[v0] Updating custom field:", params.fieldId)
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("kanban_board_custom_fields")
      .update(body)
      .eq("id", params.fieldId)
      .eq("board_id", params.boardId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Custom field updated:", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Unexpected error in PUT custom field:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { boardId: string; fieldId: string } }) {
  try {
    console.log("[v0] Deleting custom field:", params.fieldId)
    const supabase = getSupabaseServerClient()

    const { error } = await supabase
      .from("kanban_board_custom_fields")
      .delete()
      .eq("id", params.fieldId)
      .eq("board_id", params.boardId)

    if (error) {
      console.error("[v0] Error deleting custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Custom field deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in DELETE custom field:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
