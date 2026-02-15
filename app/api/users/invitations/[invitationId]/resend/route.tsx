import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { invitationId: string } }) {
  try {
    const supabase = await createServerClient()

    // Verify the user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the invitation
    const { data: invitation } = await supabase
      .from("user_invitations")
      .select("*, church_tenants(name, church_code)")
      .eq("id", params.invitationId)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    const { data: slackWorkspace } = await supabase
      .from("slack_workspaces")
      .select("team_name, team_domain")
      .eq("church_tenant_id", invitation.church_tenant_id)
      .single()

    const { data: inviter } = await supabase.from("users").select("full_name").eq("id", invitation.invited_by).single()

    // Update expiration date
    const { error } = await supabase
      .from("user_invitations")
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", params.invitationId)

    if (error) throw error

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.warn("[v0] RESEND_API_KEY not configured. Cannot resend email.")
      return NextResponse.json({
        success: true,
        warning: "Email not sent - Resend API key not configured",
      })
    }

    const church = invitation.church_tenants as any
    const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/signup?invite=${invitation.id}`

    const slackSectionHtml = slackWorkspace?.team_domain
      ? `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #065f46;">Join Our Slack Workspace</h3>
        </div>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #047857; line-height: 1.5;">
          We use Slack to stay connected as a team. Join <strong>${slackWorkspace.team_name || "our workspace"}</strong> to collaborate with other members.
        </p>
        <a href="https://${slackWorkspace.team_domain}.slack.com" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Open Slack Workspace →
        </a>
      </div>
    `
      : ""

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Church Management <onboarding@resend.dev>",
        to: invitation.email,
        subject: `Reminder: You're invited to join ${church.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reminder: You're Invited!</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  This is a reminder that ${inviter?.full_name || "someone"} invited you to join <strong>${church.name}</strong> on our church management platform.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Church Code:</p>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; color: #667eea;">${church.church_code}</p>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
                  You'll need this code when signing up to verify your membership.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Accept Invitation
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 25px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #667eea; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">
                  ${signupUrl}
                </p>
                
                ${slackSectionHtml}
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; margin: 0;">
                  This invitation was sent to ${invitation.email}. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error("[v0] Failed to resend invitation email:", errorData)
      return NextResponse.json({
        success: true,
        warning: "Email failed to send",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error resending invitation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
