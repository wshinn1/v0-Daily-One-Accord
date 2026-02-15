import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    // Fetch automations for the tenant
    const { data: automations, error } = await supabase
      .from("visitor_automations")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ automations })
  } catch (error: any) {
    console.error("[v0] Error fetching automations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant and role
    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    if (!["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, trigger_type, trigger_config, action_type, action_config, is_active } = body

    // Create automation
    const { data: automation, error } = await supabase
      .from("visitor_automations")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        description,
        trigger_type,
        trigger_config,
        action_type,
        action_config,
        is_active: is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ automation })
  } catch (error: any) {
    console.error("[v0] Error creating automation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
