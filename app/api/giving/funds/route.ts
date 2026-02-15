import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    const { data: funds, error } = await supabase
      .from("giving_funds")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("is_default", { ascending: false })
      .order("name")

    if (error) throw error

    return NextResponse.json({ funds })
  } catch (error) {
    console.error("[v0] Funds fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch funds" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, is_default } = body

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("giving_funds")
        .update({ is_default: false })
        .eq("church_tenant_id", userData.church_tenant_id)
    }

    const { data: fund, error } = await supabase
      .from("giving_funds")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        description,
        is_default: is_default || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ fund })
  } catch (error) {
    console.error("[v0] Fund creation error:", error)
    return NextResponse.json({ error: "Failed to create fund" }, { status: 500 })
  }
}
