import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ExternalAPIError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: Request, { params }: { params: { userId: string } }) => {
  console.log("[v0] 🔵 Admin password reset initiated for userId:", params.userId)

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] 🔵 Current user:", user?.id, user?.email)

  if (!user) {
    console.error("[v0] 🔴 No authenticated user found")
    throw new AuthenticationError("User not authenticated")
  }

  const { userId } = params

  // Check if user is super admin or lead admin
  console.log("[v0] 🔵 Checking permissions for user:", user.id)
  const { data: currentUserData } = await supabase
    .from("church_members")
    .select("role, church_tenant_id, users!inner(is_super_admin)")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] 🔵 Current user data:", currentUserData)

  const isSuperAdmin = currentUserData?.users?.is_super_admin
  const isLeadAdmin = currentUserData?.role === "lead_admin"

  console.log("[v0] 🔵 Permission check:", { isSuperAdmin, isLeadAdmin })

  if (!isSuperAdmin && !isLeadAdmin) {
    console.error("[v0] 🔴 Insufficient permissions")
    throw new AuthorizationError("Insufficient permissions to reset passwords")
  }

  // Get the target user's info
  console.log("[v0] 🔵 Fetching target user:", userId)
  const { data: targetUser, error: targetError } = await supabase
    .from("users")
    .select("email, church_tenant_id")
    .eq("id", userId)
    .single()

  console.log("[v0] 🔵 Target user:", targetUser, "Error:", targetError)

  if (targetError || !targetUser) {
    console.error("[v0] 🔴 Target user not found")
    throw new NotFoundError("User not found")
  }

  // Lead admins can only reset passwords for users in their own tenant
  if (!isSuperAdmin && targetUser.church_tenant_id !== currentUserData?.church_tenant_id) {
    console.error("[v0] 🔴 Tenant mismatch - cannot reset password for user from different tenant")
    throw new AuthorizationError("Cannot reset password for users from other tenants")
  }

  // Send password reset email
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  console.log("[v0] 🔵 Sending password reset email to:", targetUser.email)
  console.log("[v0] 🔵 Redirect URL:", `${redirectUrl}/reset-password`)
  console.log("[v0] 🔵 Environment check:", {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    hasResendKey: !!process.env.RESEND_API_KEY,
  })

  const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(targetUser.email, {
    redirectTo: `${redirectUrl}/reset-password`,
  })

  console.log("[v0] 🔵 Supabase resetPasswordForEmail response:", { resetData, resetError })

  if (resetError) {
    console.error("[v0] 🔴 Error sending password reset:", {
      message: resetError.message,
      status: resetError.status,
      name: resetError.name,
      email: targetUser.email,
    })
    throw new ExternalAPIError("Failed to send password reset email")
  }

  console.log("[v0] 🟢 Password reset email sent successfully to:", targetUser.email)
  return NextResponse.json({ success: true, message: "Password reset email sent" })
})
