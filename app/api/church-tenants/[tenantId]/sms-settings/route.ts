import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions
    const { data: membership } = await supabase
      .from("church_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("church_tenant_id", params.tenantId)
      .single()

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    const isSuperAdmin = userData?.is_super_admin === true
    const canViewSettings = isSuperAdmin || ["lead_admin", "admin", "staff"].includes(membership?.role || "")

    if (!canViewSettings) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Fetch SMS settings
    const { data: tenant, error: fetchError } = await supabase
      .from("church_tenants")
      .select("sms_phone_number, sms_messaging_profile_id, sms_enabled")
      .eq("id", params.tenantId)
      .single()

    if (fetchError) {
      console.error("[v0] Failed to fetch SMS settings:", fetchError)
      return NextResponse.json({ error: "Failed to fetch SMS settings" }, { status: 500 })
    }

    return NextResponse.json({
      sms_phone_number: tenant.sms_phone_number,
      sms_messaging_profile_id: tenant.sms_messaging_profile_id,
      sms_enabled: tenant.sms_enabled,
    })
  } catch (error) {
    console.error("[v0] SMS settings fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sms_phone_number, sms_messaging_profile_id, sms_enabled } = body

    // Check permissions
    const { data: membership } = await supabase
      .from("church_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("church_tenant_id", params.tenantId)
      .single()

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    const isSuperAdmin = userData?.is_super_admin === true
    const canManageSettings = isSuperAdmin || ["lead_admin", "admin"].includes(membership?.role || "")

    if (!canManageSettings) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Update SMS settings
    const { error: updateError } = await supabase
      .from("church_tenants")
      .update({
        sms_phone_number,
        sms_messaging_profile_id,
        sms_enabled,
        sms_configured_at: sms_enabled ? new Date().toISOString() : null,
      })
      .eq("id", params.tenantId)

    if (updateError) {
      console.error("[v0] Failed to update SMS settings:", updateError)
      return NextResponse.json({ error: "Failed to update SMS settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] SMS settings update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 },
    )
  }
}
