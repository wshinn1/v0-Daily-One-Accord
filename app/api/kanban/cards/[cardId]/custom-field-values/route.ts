import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    console.log("[v0] Fetching custom field values for card:", params.cardId)
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from("kanban_card_custom_field_values")
      .select("*")
      .eq("card_id", params.cardId)

    if (error) {
      console.error("[v0] Error fetching custom field values:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Custom field values fetched:", data?.length || 0)
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Unexpected error in GET custom field values:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    console.log("[v0] Updating custom field values for card:", params.cardId)
    const supabase = getSupabaseServerClient()
    const { values } = await request.json()

    // Delete existing values and insert new ones
    await supabase.from("kanban_card_custom_field_values").delete().eq("card_id", params.cardId)

    const valuesToInsert = Object.entries(values).map(([fieldId, value]) => ({
      card_id: params.cardId,
      custom_field_id: fieldId,
      field_value: value as string,
    }))

    if (valuesToInsert.length > 0) {
      const { error } = await supabase.from("kanban_card_custom_field_values").insert(valuesToInsert)

      if (error) {
        console.error("[v0] Error updating custom field values:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    console.log("[v0] Custom field values updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error in PUT custom field values:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
