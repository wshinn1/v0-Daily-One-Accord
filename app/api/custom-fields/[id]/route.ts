import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData || !["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { field_name, field_type, field_options, is_required } = body

    const { data: field, error } = await supabase
      .from("visitor_custom_fields")
      .update({
        field_name: field_name?.trim(),
        field_type,
        field_options: field_options || null,
        is_required: is_required || false,
      })
      .eq("id", id)
      .eq("church_tenant_id", userData.church_tenant_id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ field })
  } catch (error) {
    console.error("[v0] Exception in PUT /api/custom-fields/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData || !["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { error } = await supabase
      .from("visitor_custom_fields")
      .delete()
      .eq("id", id)
      .eq("church_tenant_id", userData.church_tenant_id)

    if (error) {
      console.error("[v0] Error deleting custom field:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Exception in DELETE /api/custom-fields/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
