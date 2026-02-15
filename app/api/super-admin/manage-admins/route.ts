import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { asyncHandler, AuthorizationError, ValidationError, DatabaseError } from "@/lib/errors/handler"
import { checkSuperAdmin } from "@/lib/auth/permissions"
import { createAuditLog } from "@/lib/audit-log"

export const GET = asyncHandler(async () => {
  // Verify requester is super admin
  await checkSuperAdmin()

  const supabase = await getSupabaseServiceRoleClient()

  // Get all users with super admin status
  const { data: superAdmins, error } = await supabase
    .from("users")
    .select("id, email, full_name, created_at")
    .eq("is_super_admin", true)
    .order("created_at", { ascending: true })

  if (error) {
    throw new DatabaseError("Failed to fetch super admins", error)
  }

  return NextResponse.json({ superAdmins })
})

export const POST = asyncHandler(async (request: NextRequest) => {
  // Verify requester is super admin
  await checkSuperAdmin()

  const { userId, action } = await request.json()

  if (!userId || !action) {
    throw new ValidationError("userId and action are required")
  }

  if (!["grant", "revoke"].includes(action)) {
    throw new ValidationError("action must be 'grant' or 'revoke'")
  }

  const supabase = await getSupabaseServiceRoleClient()

  // Check if target user exists
  const { data: targetUser, error: fetchError } = await supabase
    .from("users")
    .select("id, email, full_name, is_super_admin")
    .eq("id", userId)
    .single()

  if (fetchError || !targetUser) {
    throw new ValidationError("User not found")
  }

  // Prevent revoking the last super admin
  if (action === "revoke") {
    const { data: superAdminCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("is_super_admin", true)

    if (superAdminCount && superAdminCount.length <= 1) {
      throw new AuthorizationError("Cannot revoke the last super admin")
    }
  }

  // Update super admin status
  const { error: updateError } = await supabase
    .from("users")
    .update({
      is_super_admin: action === "grant",
      role: action === "grant" ? "super_admin" : "member",
    })
    .eq("id", userId)

  if (updateError) {
    throw new DatabaseError("Failed to update super admin status", updateError)
  }

  await createAuditLog({
    action: action === "grant" ? "user.updated" : "user.updated",
    resourceType: "super_admin_access",
    resourceId: userId,
    details: {
      action,
      targetEmail: targetUser.email,
      targetName: targetUser.full_name,
      previousStatus: targetUser.is_super_admin,
      newStatus: action === "grant",
    },
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  })

  return NextResponse.json({
    success: true,
    message: `Super admin access ${action === "grant" ? "granted to" : "revoked from"} ${targetUser.email}`,
  })
})
