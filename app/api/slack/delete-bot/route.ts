import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, ValidationError, DatabaseError } from "@/lib/errors/handler"

export const DELETE = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { teamId, tenantId } = await request.json()

  if (!teamId) {
    throw new ValidationError("Team ID is required")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new AuthenticationError("Unauthorized")
  }

  // Delete from slack_bot_configs
  const { error: botError } = await supabase
    .from("slack_bot_configs")
    .delete()
    .eq("team_id", teamId)
    .eq("church_tenant_id", tenantId)

  if (botError) {
    console.error("[v0] Error deleting bot config:", botError)
    throw new DatabaseError("Failed to delete bot configuration", botError)
  }

  // Delete from slack_workspaces
  const { error: workspaceError } = await supabase
    .from("slack_workspaces")
    .delete()
    .eq("team_id", teamId)
    .eq("church_tenant_id", tenantId)

  // Don't fail if workspace deletion fails, as it might not exist
  if (workspaceError) {
    console.error("[v0] Error deleting workspace:", workspaceError)
  }

  return NextResponse.json({ success: true })
})
