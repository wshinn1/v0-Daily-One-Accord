import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all business plan users
    const { data: users, error } = await supabase
      .from("business_plan_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching business plan users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { email, full_name } = await request.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and full name are required" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("business_plan_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate secure 16-character password
    const generatePassword = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*"
      let password = ""
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const password = generatePassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("business_plan_users")
      .insert({
        email: email.toLowerCase(),
        full_name,
        password_hash: hashedPassword,
        invitation_status: "sent",
        invited_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Send invitation email
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error("[v0] RESEND_API_KEY not configured")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"}/business-plan/login`
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    const fromName = process.env.RESEND_FROM_NAME || "Daily One Accord"

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: "Your Access to Daily One Accord Business Plan",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Daily One Accord</h1>
                          <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Business Plan Access</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome, ${full_name}!</h2>
                          <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                            You've been granted access to view the confidential Daily One Accord business plan. Below are your login credentials:
                          </p>
                          
                          <!-- Credentials Box -->
                          <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                            <div style="margin-bottom: 16px;">
                              <p style="margin: 0 0 4px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-family: 'Courier New', monospace;">${email}</p>
                            </div>
                            <div>
                              <p style="margin: 0 0 4px; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Password</p>
                              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-family: 'Courier New', monospace; word-break: break-all;">${password}</p>
                            </div>
                          </div>
                          
                          <p style="margin: 0 0 24px; color: #4a5568; font-size: 14px; line-height: 1.6;">
                            <strong>Important:</strong> Please save these credentials securely. You can change your password after logging in.
                          </p>
                          
                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 32px 0;">
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                              Access Business Plan
                            </a>
                          </div>
                          
                          <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>
                          <p style="margin: 8px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                            ${loginUrl}
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f7fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #718096; font-size: 12px; line-height: 1.6; text-align: center;">
                            This is a confidential document. Do not share your credentials with anyone.
                          </p>
                          <p style="margin: 8px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} Daily One Accord. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      console.error("[v0] Failed to send invitation email")
      // Don't fail the request if email fails, user is still created
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      password, // Return password so it can be displayed in the UI
    })
  } catch (error) {
    console.error("[v0] Error inviting business plan user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
