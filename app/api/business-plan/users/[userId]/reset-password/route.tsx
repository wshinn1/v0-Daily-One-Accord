import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { handleError, ValidationError } from "@/lib/errors/handler"
import { checkSuperAdmin } from "@/lib/auth/permissions"
import { Resend } from "resend"
import { validatePassword } from "@/lib/password-validation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Check if user is super admin
    await checkSuperAdmin()

    const { userId } = await params
    const { password } = await request.json()

    const validation = validatePassword(password)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(". "))
    }

    const supabase = await getSupabaseServiceRoleClient()

    const { data: user, error: fetchError } = await supabase
      .from("business_plan_users")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      throw new ValidationError("User not found")
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password.trim(), 10)

    // Update the user's password
    const { error } = await supabase
      .from("business_plan_users")
      .update({ password_hash: passwordHash })
      .eq("id", userId)

    if (error) {
      throw error
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
        to: user.email,
        subject: "Daily One Accord Business Plan - Password Reset",
        html: `
          <h2>Your Business Plan Password Has Been Reset</h2>
          <p>Hello ${user.full_name},</p>
          <p>Your password for accessing the Daily One Accord business plan has been reset by an administrator.</p>
          <p><strong>Your new login credentials:</strong></p>
          <p>Email: ${user.email}<br>
          Password: <code>${password}</code></p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/business-plan/login">Click here to login</a></p>
          <p>Please keep these credentials secure and do not share them with anyone.</p>
          <p>If you did not request this password reset, please contact support immediately.</p>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Error sending password reset email:", emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error, request)
  }
}
