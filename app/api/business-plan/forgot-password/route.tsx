import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"
import { Resend } from "resend"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"
import { generateSecurePassword } from "@/lib/password-validation"
import { createAuditLog } from "@/lib/audit-log"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, rateLimiters.auth)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const adminClient = getSupabaseServiceRoleClient()

    // Check if user exists and has business plan access
    const { data: user } = await adminClient
      .from("users")
      .select("id, email, full_name, has_business_plan_access")
      .eq("email", email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (!user || !user.has_business_plan_access) {
      return NextResponse.json({ success: true })
    }

    // Generate new password
    const newPassword = generateSecurePassword(16)

    // Update password
    const { error: passwordError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (passwordError) {
      console.error("[v0] Error resetting password:", passwordError)
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    // Send email with new password
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
      to: email,
      subject: "Business Plan Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.full_name},</p>
        <p>Your password has been reset for accessing the Daily One Accord Business Plan.</p>
        <p><strong>Your new password:</strong> <code>${newPassword}</code></p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/business-plan/login">Click here to login</a></p>
        <p>Please keep this password secure and do not share it with anyone.</p>
        <p><em>If you did not request this password reset, please contact support immediately.</em></p>
      `,
    })

    await createAuditLog({
      action: "auth.password_reset",
      resourceType: "business_plan_access",
      resourceId: user.id,
      details: {
        email: user.email,
        method: "forgot_password",
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
