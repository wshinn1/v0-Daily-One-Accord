import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/handler"

export const PATCH = asyncHandler(async (request: NextRequest, { params }: { params: { userId: string } }) => {
  const supabase = await createServerClient()
  const { role } = await request.json()

  if (!role) {
    throw new ValidationError("Role is required")
  }

  // Verify the user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to update roles")
  }

  // Get the member to check permissions
  const { data: member } = await supabase.from("church_members").select("*").eq("id", params.userId).single()

  if (!member) {
    throw new NotFoundError("Member not found")
  }

  // Check if current user has permission
  const { data: currentMember } = await supabase
    .from("church_members")
    .select("*")
    .eq("church_tenant_id", member.church_tenant_id)
    .eq("user_id", user.id)
    .single()

  if (!currentMember || !["lead_admin", "admin_staff"].includes(currentMember.role)) {
    throw new AuthorizationError("Insufficient permissions to update roles")
  }

  // Update the role
  const { error } = await supabase.from("church_members").update({ role }).eq("id", params.userId)

  if (error) throw error

  // Also update the users table for consistency
  await supabase.from("users").update({ role }).eq("id", member.user_id)

  return NextResponse.json({ success: true })
})
