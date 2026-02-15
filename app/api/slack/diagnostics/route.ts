import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, ValidationError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const searchParams = request.nextUrl.searchParams
  const tenantId = searchParams.get("tenantId")

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("Unauthorized")
  }

  // Get user data to check permissions
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    throw new AuthenticationError("User not found")
  }

  // Determine which tenant to check
  const churchTenantId = tenantId || userData.church_tenant_id

  // If super admin and no tenant specified, return error
  if (userData.is_super_admin && !churchTenantId) {
    throw new ValidationError("Please select a tenant to diagnose")
  }

  // Check if user has access to this tenant
  if (!userData.is_super_admin && churchTenantId !== userData.church_tenant_id) {
    throw new AuthenticationError("Access denied")
  }

  const issues: string[] = []
  const recommendations: string[] = []

  // Get all bot configs for this tenant's workspaces
  const { data: workspaces } = await supabase
    .from("slack_workspaces")
    .select("*")
    .eq("church_tenant_id", churchTenantId)

  if (!workspaces || workspaces.length === 0) {
    issues.push("No Slack workspaces linked to this church tenant")
    recommendations.push("Add a bot configuration in the Slack Bot Configuration section")
    recommendations.push(
      "Make sure to enter the correct Team ID (run /attendance in Slack and check Vercel logs to find it)",
    )
  }

  const teamIds = workspaces?.map((w) => w.team_id) || []

  // Get bot configs for these team IDs
  const { data: botConfigs } = await supabase
    .from("slack_bot_configs")
    .select("team_id, bot_name, signing_secret, bot_token, created_at")
    .in("team_id", teamIds.length > 0 ? teamIds : [""])

  const botConfigsWithStatus = (botConfigs || []).map((config) => ({
    team_id: config.team_id,
    bot_name: config.bot_name || "Unnamed Bot",
    has_signing_secret: !!config.signing_secret,
    has_bot_token: !!config.bot_token,
    created_at: config.created_at,
  }))

  // Check for issues
  if (botConfigsWithStatus.length === 0 && workspaces && workspaces.length > 0) {
    issues.push("Workspace is linked but bot configuration is missing")
    recommendations.push("The workspace link exists but the bot credentials are not configured")
    recommendations.push("Edit the bot configuration and add the Signing Secret and Bot Token")
  }

  botConfigsWithStatus.forEach((config) => {
    if (!config.has_signing_secret) {
      issues.push(`Bot "${config.bot_name}" (${config.team_id}) is missing Signing Secret`)
      recommendations.push(`Edit the bot configuration for ${config.bot_name} and add the Signing Secret`)
    }
    if (!config.has_bot_token) {
      issues.push(`Bot "${config.bot_name}" (${config.team_id}) is missing Bot Token`)
      recommendations.push(`Edit the bot configuration for ${config.bot_name} and add the Bot Token`)
    }
  })

  // Check for mismatched team IDs
  const configTeamIds = new Set(botConfigsWithStatus.map((c) => c.team_id))
  const workspaceTeamIds = new Set(workspaces?.map((w) => w.team_id) || [])

  workspaceTeamIds.forEach((teamId) => {
    if (!configTeamIds.has(teamId)) {
      issues.push(`Workspace ${teamId} is linked but has no bot configuration`)
      recommendations.push(`Add bot credentials for team ID: ${teamId}`)
    }
  })

  return NextResponse.json({
    botConfigs: botConfigsWithStatus,
    workspaces: workspaces || [],
    issues,
    recommendations,
  })
})
