import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: values, error } = await supabase
      .from("visitor_custom_field_values")
      .select("*, field:visitor_custom_fields(*)")
      .eq("visitor_id", id)

    if (error) {
      console.error("[v0] Error fetching custom field values:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ values })
  } catch (error) {
    console.error("[v0] Exception in GET /api/visitors/[id]/custom-fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { field_id, field_value } = body

    if (!field_id) {
      return NextResponse.json({ error: "Field ID is required" }, { status: 400 })
    }

    // Upsert the value
    const { data: value, error } = await supabase
      .from("visitor_custom_field_values")
      .upsert(
        {
          visitor_id: id,
          field_id,
          field_value: field_value || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "visitor_id,field_id",
        },
      )
      .select("*, field:visitor_custom_fields(*)")
      .single()

    if (error) {
      console.error("[v0] Error saving custom field value:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ value }, { status: 201 })
  } catch (error) {
    console.error("[v0] Exception in POST /api/visitors/[id]/custom-fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
