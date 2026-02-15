import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { teamId, teamName, tenantId, botToken, signingSecret } = await request.json()

  console.log("[v0] Link workspace request:", {
    teamId,
    teamName,
    tenantId,
    hasBotToken: !!botToken,
    hasSigningSecret: !!signingSecret,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No user found in session")
    throw new AuthenticationError("Unauthorized")
  }

  console.log("[v0] User authenticated:", user.id)

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("church_tenant_id, role")
    .eq("id", user.id)
    .single()

  if (userError) {
    console.error("[v0] Error fetching user data:", userError)
    throw new DatabaseError("Failed to fetch user data", { error: userError })
  }

  if (!userData) {
    console.log("[v0] User data not found for:", user.id)
    throw new AuthenticationError("User not found")
  }

  console.log("[v0] User data:", { role: userData.role, church_tenant_id: userData.church_tenant_id })

  const churchTenantId = tenantId || userData.church_tenant_id

  console.log("[v0] Using tenant ID:", churchTenantId)

  const isSuperAdmin = userData.role === "super_admin"
  const isLeadAdmin = userData.role === "lead_admin"
  const isAdminStaff = userData.role === "admin_staff"

  console.log("[v0] Authorization check:", { isSuperAdmin, isLeadAdmin, isAdminStaff })

  if (!isSuperAdmin && !isLeadAdmin && !isAdminStaff) {
    console.log("[v0] Insufficient permissions for role:", userData.role)
    throw new AuthorizationError("Insufficient permissions")
  }

  if (!isSuperAdmin && churchTenantId !== userData.church_tenant_id) {
    console.log("[v0] Cannot link workspace for another tenant")
    throw new AuthorizationError("Cannot link workspace for another tenant")
  }

  if (!churchTenantId) {
    console.log("[v0] No tenant specified")
    throw new ValidationError("No tenant specified")
  }

  let botUserId = null
  if (botToken) {
    try {
      console.log("[v0] Fetching bot user ID from Slack API")
      const slackResponse = await fetch("https://slack.com/api/auth.test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${botToken}`,
          "Content-Type": "application/json",
        },
      })

      const slackData = await slackResponse.json()
      console.log("[v0] Slack API response:", { ok: slackData.ok, user_id: slackData.user_id })

      if (slackData.ok && slackData.user_id) {
        botUserId = slackData.user_id
        console.log("[v0] Successfully retrieved bot_user_id:", botUserId)
      } else {
        console.error("[v0] Slack API error:", slackData.error)
        throw new ExternalAPIError("Invalid bot token", { details: slackData.error })
      }
    } catch (slackError) {
      console.error("[v0] Error calling Slack API:", slackError)
      throw new ExternalAPIError("Failed to verify bot token with Slack")
    }
  }

  console.log("[v0] Attempting to upsert slack_workspace:", {
    church_tenant_id: churchTenantId,
    team_id: teamId,
    team_name: teamName,
    has_bot_token: !!botToken,
    has_signing_secret: !!signingSecret,
    bot_user_id: botUserId,
  })

  const { error } = await supabase.from("slack_workspaces").upsert(
    {
      church_tenant_id: churchTenantId,
      team_id: teamId,
      team_name: teamName || null,
      bot_token: botToken,
      bot_user_id: botUserId,
      signing_secret: signingSecret || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "team_id",
    },
  )

  if (error) {
    console.error("[v0] Database error linking workspace:", {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw new DatabaseError("Failed to link workspace", { error: error })
  }

  console.log("[v0] Attempting to upsert slack_bot_configs")
  const { error: botConfigError } = await supabase.from("slack_bot_configs").upsert(
    {
      church_tenant_id: churchTenantId,
      team_id: teamId,
      bot_name: teamName || "Slack Bot",
      bot_token: botToken,
      signing_secret: signingSecret || null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "team_id",
    },
  )

  if (botConfigError) {
    console.error("[v0] Database error saving bot config:", {
      error: botConfigError,
      code: botConfigError.code,
      message: botConfigError.message,
    })
    throw new DatabaseError("Failed to save bot configuration", { error: botConfigError })
  }

  console.log("[v0] Successfully linked workspace and saved bot config")
  return NextResponse.json({ success: true })
})
