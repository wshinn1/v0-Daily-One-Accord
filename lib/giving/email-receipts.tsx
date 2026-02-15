import { sendEmail } from "@/lib/email"

interface DonationReceiptData {
  donorEmail: string
  donorName: string | null
  amount: number
  fundName: string | null
  campaignName: string | null
  donationDate: string
  transactionId: string
  churchName: string
  isRecurring: boolean
}

export async function sendDonationReceipt(data: DonationReceiptData) {
  const {
    donorEmail,
    donorName,
    amount,
    fundName,
    campaignName,
    donationDate,
    transactionId,
    churchName,
    isRecurring,
  } = data

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100)

  const formattedDate = new Date(donationDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const subject = `Thank you for your ${isRecurring ? "recurring " : ""}donation to ${churchName}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Thank You for Your Generosity!</h1>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Dear ${donorName || "Friend"},
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for your ${isRecurring ? "recurring " : ""}donation to ${churchName}. 
            Your generosity helps us continue our mission and serve our community.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">Donation Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Amount:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${formattedDate}</td>
              </tr>
              ${
                fundName
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Fund:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${fundName}</td>
              </tr>
              `
                  : ""
              }
              ${
                campaignName
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Campaign:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${campaignName}</td>
              </tr>
              `
                  : ""
              }
              <tr>
                <td style="padding: 10px 0;"><strong>Transaction ID:</strong></td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
              </tr>
            </table>
          </div>
          
          ${
            isRecurring
              ? `
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Recurring Donation:</strong> This donation will automatically process on a recurring basis. 
              You can manage or cancel your recurring donation at any time through your donor portal.
            </p>
          </div>
          `
              : ""
          }
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            This email serves as your receipt for tax purposes. Please keep it for your records.
          </p>
          
          <p style="font-size: 16px; margin-top: 30px;">
            With gratitude,<br>
            <strong>${churchName}</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8;">
            Powered by Daily One Accord<br>
            Church Management System
          </p>
        </div>
      </body>
    </html>
  `

  const text = `
Thank You for Your Generosity!

Dear ${donorName || "Friend"},

Thank you for your ${isRecurring ? "recurring " : ""}donation to ${churchName}. 
Your generosity helps us continue our mission and serve our community.

Donation Details:
- Amount: ${formattedAmount}
- Date: ${formattedDate}
${fundName ? `- Fund: ${fundName}` : ""}
${campaignName ? `- Campaign: ${campaignName}` : ""}
- Transaction ID: ${transactionId}

${isRecurring ? "This is a recurring donation that will automatically process on a regular basis. You can manage or cancel your recurring donation at any time." : ""}

This email serves as your receipt for tax purposes. Please keep it for your records.

With gratitude,
${churchName}

---
Powered by Daily One Accord
Church Management System
  `

  try {
    await sendEmail({
      to: donorEmail,
      subject,
      html,
      text,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send donation receipt:", error)
    throw error
  }
}
