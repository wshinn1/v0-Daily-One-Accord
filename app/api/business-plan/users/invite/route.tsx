import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { asyncHandler, AuthenticationError, ValidationError, DatabaseError } from "@/lib/errors/handler"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateSecurePassword(length = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*"
  const allChars = uppercase + lowercase + numbers + symbols

  let password = ""
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export const POST = asyncHandler(async (req: NextRequest) => {
  console.log("[v0] Business plan invite API called")

  const supabase = await createServerClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Current user ID:", user?.id || "none")

  if (!user) {
    throw new AuthenticationError("You must be logged in to invite users")
  }

  // Check if user is super admin
  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  console.log("[v0] Is super admin:", userData?.is_super_admin || false)

  if (!userData?.is_super_admin) {
    throw new AuthenticationError("Only super admins can invite business plan users")
  }

  const body = await req.json()
  const { email, full_name } = body

  console.log("[v0] Invite request for:", email, full_name)

  if (!email || !full_name) {
    throw new ValidationError("Email and full name are required")
  }

  const trimmedEmail = email.toLowerCase().trim()
  const trimmedName = full_name.trim()

  console.log("[v0] Trimmed email:", trimmedEmail)
  console.log("[v0] Trimmed name:", trimmedName)

  // Check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from("business_plan_users")
    .select("id")
    .eq("email", trimmedEmail)
    .maybeSingle()

  console.log("[v0] Existing user check - found:", !!existingUser, "error:", checkError?.message || "none")

  if (existingUser) {
    throw new ValidationError("A user with this email already exists")
  }

  // Generate secure password
  console.log("[v0] Generating password...")
  const password = generateSecurePassword(16)
  const passwordHash = await bcrypt.hash(password, 10)
  console.log("[v0] Password generated and hashed")

  // Create user in database
  console.log("[v0] Inserting user into database...")
  const { data: newUser, error: insertError } = await supabase
    .from("business_plan_users")
    .insert({
      email: trimmedEmail,
      full_name: trimmedName,
      password_hash: passwordHash,
      access_granted: true,
      invited_by: user.id,
    })
    .select()
    .single()

  console.log("[v0] Insert result - success:", !!newUser, "error:", insertError?.message || "none")

  if (insertError) {
    console.error("[v0] Error creating business plan user:", insertError)
    throw new DatabaseError("Failed to create user", { originalError: insertError })
  }

  console.log("[v0] User created successfully:", newUser.id)

  // Send invitation email
  console.log("[v0] Sending invitation email...")
  try {
    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || "Daily One Accord"} <${process.env.RESEND_FROM_EMAIL}>`,
      to: trimmedEmail,
      subject: "Your Business Plan Access - Daily One Accord",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Daily One Accord</h1>
                <p style="margin: 10px 0 0 0;">Business Plan Access Granted</p>
              </div>
              <div class="content">
                <p>Hello ${trimmedName},</p>
                <p>You've been granted access to the Daily One Accord Business Plan. Use the credentials below to log in:</p>
                
                <div class="credentials">
                  <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${trimmedEmail}</p>
                  <p style="margin: 0;"><strong>Password:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
                </div>

                <p><strong>Important:</strong> Please save these credentials securely. For security reasons, we cannot recover your password if lost.</p>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"}/business-plan/login" class="button">
                    Access Business Plan
                  </a>
                </div>

                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">If you have any questions, please contact your administrator.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Daily One Accord. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log("[v0] Business plan invitation email sent successfully to:", trimmedEmail)
  } catch (emailError) {
    console.error("[v0] Error sending invitation email:", emailError)
    // Don't throw - user was created successfully, email is secondary
  }

  console.log("[v0] Invitation process complete")

  return NextResponse.json({
    success: true,
    message: "User invited successfully",
    user: {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
    },
  })
})
