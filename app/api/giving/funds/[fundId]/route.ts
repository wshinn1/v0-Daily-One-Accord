import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { fundId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    if (!["admin", "lead_admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, is_default, is_active } = body

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("giving_funds")
        .update({ is_default: false })
        .eq("church_tenant_id", userData.church_tenant_id)
    }

    const { data: fund, error } = await supabase
      .from("giving_funds")
      .update({ name, description, is_default, is_active })
      .eq("id", params.fundId)
      .eq("church_tenant_id", userData.church_tenant_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ fund })
  } catch (error) {
    console.error("[v0] Fund update error:", error)
    return NextResponse.json({ error: "Failed to update fund" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { fundId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    if (!["admin", "lead_admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { error } = await supabase
      .from("giving_funds")
      .delete()
      .eq("id", params.fundId)
      .eq("church_tenant_id", userData.church_tenant_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Fund deletion error:", error)
    return NextResponse.json({ error: "Failed to delete fund" }, { status: 500 })
  }
}
