import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, rateLimiters.invitations)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }

  try {
    const supabase = await createServerClient()
    const { email, role, tenantId, invitedBy } = await request.json()

    console.log("[v0] 🔵 INVITE: Starting invitation process for:", email)

    // Verify the inviter has permission
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already exists in this church
    const { data: existingMember } = await supabase
      .from("church_members")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .eq("user_id", user.id)
      .single()

    if (existingMember && !["lead_admin", "admin_staff"].includes(existingMember.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { data: church, error: churchError } = await supabase
      .from("church_tenants")
      .select("name, church_code")
      .eq("id", tenantId)
      .single()

    if (churchError || !church) {
      console.error("[v0] Church not found:", churchError)
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    const { data: slackWorkspace } = await supabase
      .from("slack_workspaces")
      .select("team_name, team_domain")
      .eq("church_tenant_id", tenantId)
      .single()

    const { data: inviter } = await supabase.from("users").select("full_name, email").eq("id", invitedBy).single()

    console.log("[v0] 🔵 INVITE: Checking for existing invitation...")
    const { data: existingInvitation } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .eq("email", email)
      .single()

    let invitation

    if (existingInvitation) {
      console.log("[v0] 🟡 INVITE: Found existing invitation:", existingInvitation.id)

      console.log("[v0] 🔵 INVITE: Checking if user is a member of this church...")
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      if (existingUser) {
        // User account exists, now check if they're a member of this church
        const { data: existingMember } = await supabase
          .from("church_members")
          .select("id")
          .eq("user_id", existingUser.id)
          .eq("church_tenant_id", tenantId)
          .single()

        if (existingMember) {
          // User is already a member of this church
          console.log("[v0] 🔴 INVITE: User is already a member of this church, returning duplicate error")
          return NextResponse.json(
            {
              error:
                "An invitation has already been sent to this email address. You can resend it from the pending invitations list.",
              code: "DUPLICATE_INVITATION",
            },
            { status: 409 },
          )
        } else {
          // User exists but is not a member of this church (was removed), update the invitation
          console.log("[v0] 🟡 INVITE: User was removed from church, will update existing invitation...")
        }
      } else {
        // User account doesn't exist at all
        console.log("[v0] 🟡 INVITE: User account doesn't exist, will update existing invitation...")
      }

      // Update the existing invitation (either user was removed or account was deleted)
      const { data: updatedInvitation, error: updateError } = await supabase
        .from("user_invitations")
        .update({
          role,
          invited_by: invitedBy,
          status: "pending", // Reset status to pending
          accepted_at: null, // Clear the accepted timestamp
          created_at: new Date().toISOString(), // Reset the invitation timestamp
        })
        .eq("id", existingInvitation.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] 🔴 INVITE: Failed to update invitation:", updateError)
        return NextResponse.json({ error: "Failed to update invitation. Please try again." }, { status: 500 })
      }

      console.log("[v0] 🟢 INVITE: Invitation updated successfully:", updatedInvitation.id)

      invitation = updatedInvitation
    } else {
      console.log("[v0] 🟢 INVITE: No existing invitation found, proceeding with new invitation")

      console.log("[v0] 🔵 INVITE: Creating new invitation...")
      const { data: newInvitation, error } = await supabase
        .from("user_invitations")
        .insert({
          church_tenant_id: tenantId,
          email,
          role,
          invited_by: invitedBy,
          status: "pending", // Set status to pending
          accepted_at: null, // Clear the accepted timestamp
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] 🔴 INVITE: Failed to create invitation:", error)
        if (error.code === "23505") {
          return NextResponse.json(
            {
              error:
                "An invitation has already been sent to this email address. You can resend it from the pending invitations list.",
              code: "DUPLICATE_INVITATION",
            },
            { status: 409 },
          )
        }
        throw error
      }

      console.log("[v0] 🟢 INVITE: Invitation created successfully:", newInvitation.id)

      invitation = newInvitation
    }

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error("[v0] 🔴 INVITE: RESEND_API_KEY not configured")
      return NextResponse.json({
        success: false,
        error: "Email service not configured. Please contact your administrator.",
      })
    }

    console.log("[v0] 🔵 INVITE: RESEND_API_KEY found, attempting to send email...")

    const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/join?invite=${invitation.id}`

    console.log("[v0] 🔵 INVITE: Signup URL:", signupUrl)

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
    const fromName = process.env.RESEND_FROM_NAME || "Church Management"

    const slackSectionHtml = slackWorkspace?.team_domain
      ? `
      <!-- Slack Section -->
      <tr>
        <td style="padding: 0 30px 30px 30px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; overflow: hidden; border: 2px solid #10b981;">
            <tr>
              <td style="padding: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 12px;">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#10b981"/>
                  </svg>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #065f46;">Join Our Slack Workspace</h3>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #047857; line-height: 1.5;">
                  We use Slack to stay connected as a team. Join <strong>${slackWorkspace.team_name || "our workspace"}</strong> to collaborate with other members.
                </p>
                <a href="https://${slackWorkspace.team_domain}.slack.com" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  Open Slack Workspace →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
      : ""

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: `You're invited to join ${church.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @media only screen and (max-width: 600px) {
                  .container { width: 100% !important; }
                  .header { padding: 20px !important; }
                  .content { padding: 20px !important; }
                }
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" class="container" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      
                      <!-- Header -->
                      <tr>
                        <td class="header" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                          <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">You're Invited!</h1>
                          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 400;">Join your church community</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td class="content" style="padding: 40px 30px;">
                          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
                            <strong>${inviter?.full_name || "Someone"}</strong> has invited you to join <strong style="color: #4f46e5;">${church.name}</strong> on the church management platform.
                          </p>
                          
                          <!-- Church Code Box -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                            <tr>
                              <td style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 24px; border-radius: 12px; border: 2px solid #4f46e5;">
                                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your Church Code</p>
                                <p style="margin: 0; font-size: 32px; font-weight: 700; font-family: 'Courier New', monospace; color: #4f46e5; letter-spacing: 2px;">${church.church_code}</p>
                                <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280; line-height: 1.5;">You'll need this code when signing up to verify your membership.</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- CTA Button -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); transition: all 0.3s;">
                                  Accept Invitation →
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Divider -->
                          <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                            <tr>
                              <td style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                                <p style="font-size: 12px; color: #9ca3af; margin: 0 0 12px 0;">Or copy and paste this link into your browser:</p>
                                <p style="font-size: 12px; color: #4f46e5; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 6px; margin: 0; font-family: 'Courier New', monospace;">
                                  ${signupUrl}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      ${slackSectionHtml}
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
                          <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5; text-align: center;">
                            This invitation was sent to <strong>${email}</strong><br>
                            If you didn't expect this invitation, you can safely ignore this email.
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

    console.log("[v0] 🔵 INVITE: Resend API response status:", emailResponse.status)

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error("[v0] 🔴 INVITE: Resend API error:", errorData)
      return NextResponse.json({
        success: false,
        error: `Failed to send email: ${errorData.message || "Unknown error"}`,
      })
    }

    const emailData = await emailResponse.json()
    console.log("[v0] 🟢 INVITE: Email sent successfully:", emailData)

    return NextResponse.json({
      success: true,
      invitation,
      message: "Invitation sent successfully!",
    })
  } catch (error: any) {
    console.error("[v0] 🔴 INVITE: Error creating invitation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
