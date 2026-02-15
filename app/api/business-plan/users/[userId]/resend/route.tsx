import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
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

    const { userId } = params

    // Get user details
    const { data: businessPlanUser, error: fetchError } = await supabase
      .from("business_plan_users")
      .select("*")
      .eq("id", userId)
      .single()

    if (fetchError || !businessPlanUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send reminder email using Resend
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    const fromName = process.env.RESEND_FROM_NAME || "Daily One Accord"
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [businessPlanUser.email],
            subject: "Reminder: Access Daily One Accord Business Plan",
            html: `
              <!DOCTYPE html>
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Business Plan Access Reminder</h2>
                    <p>Hello ${businessPlanUser.full_name || "there"},</p>
                    <p>This is a reminder that you have access to the Daily One Accord Business Plan.</p>
                    <p><strong>Your email:</strong> ${businessPlanUser.email}</p>
                    <p>If you've forgotten your password, please contact your administrator.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${siteUrl}/business-plan/login" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
                        Access Business Plan
                      </a>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }),
        })
      } catch (emailError) {
        console.error("Error sending reminder email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resending invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
