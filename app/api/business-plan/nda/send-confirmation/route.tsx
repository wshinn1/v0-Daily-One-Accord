import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, fullName, signatureUrl } = await request.json()

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com"
    const fromName = process.env.RESEND_FROM_NAME || "Daily One Accord"

    // Send to the signer
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: "NDA Signed - Daily One Accord Business Plan Access",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">NDA Successfully Signed</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for signing the Mutual Non-Disclosure Agreement with Daily One Accord.</p>
          <p>You now have access to our business plan. You can view your signed NDA at any time by clicking the link below:</p>
          <p><a href="${signatureUrl}" style="color: #667eea;">View Signed NDA</a></p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>Wes Shinn<br>Founder & CEO, Daily One Accord</p>
        </div>
      `,
    })

    // Send to Wes (super admin)
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: "weshinn@gmail.com",
      subject: `NDA Signed by ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">New NDA Signature</h2>
          <p><strong>${fullName}</strong> (${email}) has signed the NDA.</p>
          <p><strong>Signed at:</strong> ${new Date().toLocaleString()}</p>
          <p><a href="${signatureUrl}" style="color: #667eea;">View Signed NDA</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error sending NDA confirmation:", error)
    return NextResponse.json({ error: "Failed to send confirmation" }, { status: 500 })
  }
}
