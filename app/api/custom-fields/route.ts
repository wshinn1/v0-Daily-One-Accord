import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: fields, error } = await supabase
      .from("visitor_custom_fields")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching custom fields:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fields })
  } catch (error) {
    console.error("[v0] Exception in GET /api/custom-fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { field_name, field_type, field_options, is_required } = body

    if (!field_name || !field_type) {
      return NextResponse.json({ error: "Field name and type are required" }, { status: 400 })
    }

    // Get max display_order
    const { data: maxOrderData } = await supabase
      .from("visitor_custom_fields")
      .select("display_order")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("display_order", { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrderData?.display_order || 0) + 1

    const { data: field, error } = await supabase
      .from("visitor_custom_fields")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        field_name: field_name.trim(),
        field_type,
        field_options: field_options || null,
        is_required: is_required || false,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error("[v0] Exception in POST /api/custom-fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
