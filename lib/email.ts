export async function sendEmail({
  to,
  subject,
  html,
  text,
}: { to: string; subject: string; html?: string; text?: string }) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not configured")
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  const fromName = process.env.RESEND_FROM_NAME || "Daily One Accord"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to send email: ${errorData.message}`)
  }

  const data = await response.json()
  return {
    success: true,
    messageId: data.id,
  }
}
