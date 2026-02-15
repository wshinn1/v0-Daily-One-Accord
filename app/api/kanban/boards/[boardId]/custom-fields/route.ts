import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    console.log("[v0] Fetching custom fields for board:", params.boardId)
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from("kanban_board_custom_fields")
      .select("*")
      .eq("board_id", params.boardId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching custom fields:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Custom fields fetched:", data?.length || 0)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Unexpected error in GET custom fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    console.log("[v0] Creating custom field for board:", params.boardId)
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("kanban_board_custom_fields")
      .insert({
        board_id: params.boardId,
        ...body,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Custom field created:", data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Unexpected error in POST custom field:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
