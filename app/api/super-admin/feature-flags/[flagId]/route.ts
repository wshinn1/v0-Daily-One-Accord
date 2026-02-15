import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { createAuditLog } from "@/lib/audit-log"

export const PATCH = asyncHandler(async (req: NextRequest, { params }: { params: { flagId: string } }) => {
  const supabase = await createClient()

  // Verify super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { enabled_by_default, tenantId, enabled, notes } = body

  // Update global flag or tenant override
  if (tenantId) {
    // Update tenant-specific override
    const { data: flag } = await supabase.from("feature_flags").select("flag_key").eq("id", params.flagId).single()

    const { error } = await supabase.from("tenant_feature_flags").upsert({
      church_tenant_id: tenantId,
      feature_flag_id: params.flagId,
      enabled,
      enabled_by: user.id,
      notes,
    })

    if (error) throw error

    await createAuditLog({
      action: enabled ? "feature_flag.enabled" : "feature_flag.disabled",
      resourceType: "tenant_feature_flag",
      resourceId: tenantId,
      details: { flag_key: flag?.flag_key, tenantId },
    })
  } else {
    // Update global default
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled_by_default, updated_at: new Date().toISOString() })
      .eq("id", params.flagId)

    if (error) throw error

    await createAuditLog({
      action: "feature_flag.enabled",
      resourceType: "feature_flag",
      resourceId: params.flagId,
      details: { enabled_by_default },
    })
  }

  return NextResponse.json({ success: true })
})
