import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { requestType, subject, description, userId, userEmail, userName, churchName, churchTenantId } = body

    // Store the support request in the database
    const { data: supportRequest, error: dbError } = await supabase
      .from("support_requests")
      .insert({
        request_type: requestType,
        subject,
        description,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        church_name: churchName,
        church_tenant_id: churchTenantId,
        status: "open",
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Error storing support request:", dbError)
      throw new Error("Failed to store support request")
    }

    // Send email to hello@dailyoneaccord.com
    const requestTypeLabel = requestType === "help" ? "Help Request" : "Feature Request"

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: "hello@dailyoneaccord.com",
      subject: `[${requestTypeLabel}] ${subject}`,
      html: `
        <h2>${requestTypeLabel} from ${churchName}</h2>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p><strong>Church:</strong> ${churchName}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Description:</h3>
        <p>${description.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>Request ID: ${supportRequest.id}</small></p>
        <p><small>Church Tenant ID: ${churchTenantId}</small></p>
      `,
    })

    // Send auto-response to user
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: userEmail,
      subject: `We received your ${requestType === "help" ? "help request" : "feature request"}`,
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${userName},</p>
        <p>We've received your ${requestType === "help" ? "help request" : "feature request"} and our team will review it shortly.</p>
        <h3>Your Request:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Description:</strong></p>
        <p>${description.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><strong>What happens next?</strong></p>
        <p>Our support team will respond to your request within 48 hours. Sometimes we respond much quicker!</p>
        <p>We'll send our response to this email address: ${userEmail}</p>
        <br>
        <p>Best regards,<br>The Daily One Accord Team</p>
      `,
    })

    return NextResponse.json({ success: true, requestId: supportRequest.id })
  } catch (error) {
    console.error("[v0] Support request error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit support request" },
      { status: 500 },
    )
  }
}
