import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, churchName, churchCode, churchId } = await request.json()

    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to Daily One Accord - Your Church Code: ${churchCode}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Daily One Accord!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Hi ${churchName} Team! 🎉</h2>
              
              <p>Thank you for subscribing to Daily One Accord. Your church management platform is ready to go!</p>
              
              <div style="background: white; border: 3px solid #667eea; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Church Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: 'Courier New', monospace;">${churchCode}</p>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">Keep this code safe - your team will need it to join</p>
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ Important Information</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
                  <li>Share this code with your team members so they can create accounts</li>
                  <li>You can change this code later in your dashboard settings</li>
                  <li>Keep it secure - anyone with this code can join your church</li>
                </ul>
              </div>
              
              <h3 style="color: #667eea; margin-top: 30px;">Next Steps:</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Complete your profile:</strong> Set up your account details</li>
                <li style="margin-bottom: 10px;"><strong>Invite your team:</strong> Share your church code with staff members</li>
                <li style="margin-bottom: 10px;"><strong>Explore features:</strong> Check out attendance tracking, visitor management, and more</li>
                <li style="margin-bottom: 10px;"><strong>Connect integrations:</strong> Link Slack, Google Drive, and SMS services</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
                Need help? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help" style="color: #667eea;">Help Center</a>.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                This email was sent to ${email} because you subscribed to Daily One Accord.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Error sending welcome email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Welcome email sent:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Welcome email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
