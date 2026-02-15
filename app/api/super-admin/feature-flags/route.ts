import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { createAuditLog } from "@/lib/audit-log"

export const GET = asyncHandler(async (req: NextRequest) => {
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

  // Get all feature flags with tenant override counts
  const { data: flags, error } = await supabase
    .from("feature_flags")
    .select(`
      *,
      tenant_feature_flags(count)
    `)
    .order("name")

  if (error) throw error

  return NextResponse.json({ flags })
})

export const POST = asyncHandler(async (req: NextRequest) => {
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
  const { flag_key, name, description, enabled_by_default } = body

  // Create new feature flag
  const { data: flag, error } = await supabase
    .from("feature_flags")
    .insert({
      flag_key,
      name,
      description,
      enabled_by_default,
    })
    .select()
    .single()

  if (error) throw error

  // Audit log
  await createAuditLog({
    action: "feature_flag.enabled",
    resourceType: "feature_flag",
    resourceId: flag.id,
    details: { flag_key, name },
  })

  return NextResponse.json({ flag })
})
