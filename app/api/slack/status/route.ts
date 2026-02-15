import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, DatabaseError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User not authenticated")
  }

  let churchTenantId = tenantId

  // If no tenantId provided, get from user's profile
  if (!churchTenantId) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("church_tenant_id")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.church_tenant_id) {
      throw new DatabaseError("No tenant found for user")
    }
    churchTenantId = userData.church_tenant_id
  }

  // Get all bot configs for this tenant
  const { data: botConfigs } = await supabase
    .from("slack_bot_configs")
    .select("team_id, bot_name, created_at")
    .eq("church_tenant_id", churchTenantId)

  // Get all workspace links for this tenant
  const { data: workspaces } = await supabase
    .from("slack_workspaces")
    .select("team_id, team_name")
    .eq("church_tenant_id", churchTenantId)

  return NextResponse.json({
    bots: botConfigs || [],
    workspaces: workspaces || [],
    botConfigured: (botConfigs?.length || 0) > 0,
    workspaceLinked: (workspaces?.length || 0) > 0,
  })
})
