import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("Unauthorized")
  }

  const { teamId, signingSecret, botToken, botName, tenantId } = await request.json()

  if (!teamId || !signingSecret || !botToken) {
    throw new ValidationError("Missing required fields: teamId, signingSecret, botToken")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("church_tenant_id, is_super_admin")
    .eq("id", user.id)
    .single()

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Determine which tenant to use
  const churchTenantId = tenantId || userData.church_tenant_id

  if (!churchTenantId) {
    return NextResponse.json({ error: "No tenant specified" }, { status: 400 })
  }

  const isSuperAdmin = userData.is_super_admin

  if (!isSuperAdmin) {
    // Check if user has admin role in church_members for this tenant
    const { data: memberData } = await supabase
      .from("church_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("church_tenant_id", churchTenantId)
      .single()

    const isLeadAdmin = memberData?.role === "lead_admin"
    const isAdminStaff = memberData?.role === "admin_staff"

    if (!isLeadAdmin && !isAdminStaff) {
      console.error("[v0] Insufficient permissions:", { userId: user.id, role: memberData?.role, churchTenantId })
      throw new AuthorizationError("Insufficient permissions to configure Slack bot")
    }
  }

  console.log("[v0] Configuring bot:", { teamId, churchTenantId, botName })

  // Store bot configuration in slack_bot_configs table
  const { error: configError } = await supabase.from("slack_bot_configs").upsert(
    {
      team_id: teamId,
      church_tenant_id: churchTenantId,
      signing_secret: signingSecret,
      bot_token: botToken,
      bot_name: botName || "Slack Bot",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "team_id",
    },
  )

  if (configError) {
    console.error("[v0] Failed to update bot configuration:", configError)
    throw new DatabaseError("Failed to update bot configuration", configError)
  }

  console.log("[v0] Bot configured successfully")
  return NextResponse.json({ success: true })
})
