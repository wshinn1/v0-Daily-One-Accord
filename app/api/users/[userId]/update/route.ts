import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler, AuthenticationError, AuthorizationError, DatabaseError } from "@/lib/errors/handler"

export const PATCH = asyncHandler(async (request: Request, { params }: { params: { userId: string } }) => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to update user information")
  }

  const { userId } = params
  const body = await request.json()
  const { full_name, email, phone } = body

  // Check if user is super admin or lead admin
  const { data: currentUserData } = await supabase
    .from("church_members")
    .select("role, church_tenant_id, users!inner(is_super_admin)")
    .eq("user_id", user.id)
    .single()

  const isSuperAdmin = currentUserData?.users?.is_super_admin
  const isLeadAdmin = currentUserData?.role === "lead_admin"

  if (!isSuperAdmin && !isLeadAdmin) {
    throw new AuthorizationError("Insufficient permissions to update users")
  }

  // Get the target user's church_tenant_id
  const { data: targetUser } = await supabase
    .from("church_members")
    .select("church_tenant_id")
    .eq("user_id", userId)
    .single()

  // Lead admins can only edit users in their own tenant
  if (!isSuperAdmin && targetUser?.church_tenant_id !== currentUserData?.church_tenant_id) {
    throw new AuthorizationError("Cannot edit users from other tenants")
  }

  // Update user info in users table
  const updateData: any = {}
  if (full_name !== undefined) updateData.full_name = full_name
  if (phone !== undefined) updateData.phone = phone

  const { error: updateError } = await supabase.from("users").update(updateData).eq("id", userId)

  if (updateError) {
    throw new DatabaseError("Failed to update user", { originalError: updateError })
  }

  // If email is being updated, update auth email
  if (email && email !== "") {
    const { error: emailError } = await supabase.auth.admin.updateUserById(userId, {
      email: email,
    })

    if (emailError) {
      throw new DatabaseError("Failed to update email", { originalError: emailError })
    }
  }

  return NextResponse.json({ success: true })
})
