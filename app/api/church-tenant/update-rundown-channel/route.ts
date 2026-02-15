import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { churchTenantId, channelName } = await request.json()

  if (!churchTenantId || !channelName) {
    throw new ValidationError("Church tenant ID and channel name are required")
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to update rundown channel")
  }

  // Verify user is lead_admin or admin_staff for this church tenant
  const { data: userData } = await supabase.from("users").select("role, church_tenant_id").eq("id", user.id).single()

  if (
    !userData ||
    userData.church_tenant_id !== churchTenantId ||
    (userData.role !== "lead_admin" && userData.role !== "admin_staff")
  ) {
    throw new AuthorizationError("Insufficient permissions to update rundown channel")
  }

  // Update the rundown channel name
  const { error } = await supabase
    .from("church_tenants")
    .update({ rundown_channel_name: channelName })
    .eq("id", churchTenantId)

  if (error) {
    throw new DatabaseError("Failed to update rundown channel", { originalError: error })
  }

  return NextResponse.json({ success: true })
})
