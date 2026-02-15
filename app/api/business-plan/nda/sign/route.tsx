import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"
import { put } from "@vercel/blob"
import crypto from "crypto"
import { renderToBuffer } from "@react-pdf/renderer"
import { NdaPdfDocument } from "@/components/business-plan/nda-pdf-document"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, email, full_name, has_business_plan_access")
      .eq("id", user.id)
      .single()

    if (!userData || !userData.has_business_plan_access) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if already signed
    const { data: existingSignature } = await supabase
      .from("nda_signatures")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existingSignature) {
      return NextResponse.json({ error: "NDA already signed" }, { status: 400 })
    }

    const { signatureData, fullName } = await request.json()

    if (!signatureData || !fullName) {
      return NextResponse.json({ error: "Signature and full name are required" }, { status: 400 })
    }

    // Get IP address and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const signedAt = new Date().toISOString()

    // Create document hash
    const ndaContent = `NDA-v1.0-${userData.email}-${signedAt}`
    const documentHash = crypto.createHash("sha256").update(ndaContent).digest("hex")

    const pdfBuffer = await renderToBuffer(
      NdaPdfDocument({
        fullName,
        email: userData.email,
        signatureData,
        signedAt,
        ipAddress,
        userAgent,
      }),
    )

    const pdfBlob = await put(`nda-pdfs/${user.id}-${Date.now()}.pdf`, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    })

    // Upload signature image separately for display
    const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    const signatureBlob = await put(`nda-signatures/${user.id}-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png",
    })

    const adminClient = getSupabaseServiceRoleClient()

    // Insert signature record
    const { error: insertError } = await adminClient.from("nda_signatures").insert({
      user_id: user.id,
      full_name: fullName,
      email: userData.email,
      signature_data: signatureBlob.url,
      ip_address: ipAddress,
      user_agent: userAgent,
      document_version: "1.0",
      document_hash: documentHash,
      pdf_url: pdfBlob.url,
      signed_at: signedAt,
    })

    if (insertError) {
      console.error("[v0] Error inserting NDA signature:", insertError)
      return NextResponse.json({ error: "Failed to save signature" }, { status: 500 })
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
        to: userData.email,
        subject: "Your Signed NDA - Daily One Accord",
        html: `
          <h2>NDA Signed Successfully</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for signing the Mutual Non-Disclosure Agreement with Daily One Accord.</p>
          <p>Your signed NDA has been recorded with the following details:</p>
          <ul>
            <li><strong>Signed At:</strong> ${new Date(signedAt).toLocaleString()}</li>
            <li><strong>Document Version:</strong> 1.0</li>
            <li><strong>Verification Hash:</strong> ${documentHash.substring(0, 16)}...</li>
          </ul>
          <p>A copy of your signed NDA is attached to this email for your records. You can also access it anytime from your business plan dashboard.</p>
          <p>You now have full access to the Daily One Accord business plan.</p>
          <p>Best regards,<br/>The Daily One Accord Team</p>
        `,
        attachments: [
          {
            filename: `NDA-${fullName.replace(/\s+/g, "-")}-${new Date(signedAt).toISOString().split("T")[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      })
    } catch (emailError) {
      console.error("[v0] Error sending NDA confirmation email to user:", emailError)
      // Don't fail the request if email fails
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
        to: "weshinn@gmail.com",
        subject: `NDA Signed by ${fullName}`,
        html: `
          <h2>New NDA Signature</h2>
          <p><strong>${fullName}</strong> (${userData.email}) has signed the NDA.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Signed At:</strong> ${new Date(signedAt).toLocaleString()}</li>
            <li><strong>IP Address:</strong> ${ipAddress}</li>
            <li><strong>Document Version:</strong> 1.0</li>
            <li><strong>Verification Hash:</strong> ${documentHash}</li>
          </ul>
          <p>The signed NDA is attached to this email and stored in the system.</p>
          <p><a href="${pdfBlob.url}">View PDF Online</a></p>
        `,
        attachments: [
          {
            filename: `NDA-${fullName.replace(/\s+/g, "-")}-${new Date(signedAt).toISOString().split("T")[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      })
    } catch (emailError) {
      console.error("[v0] Error sending NDA notification to admin:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, pdfUrl: pdfBlob.url })
  } catch (error) {
    console.error("[v0] Error signing NDA:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
