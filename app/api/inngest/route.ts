import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import {
  sendScheduledSMS,
  sendNewsletterCampaign,
  sendEventReminder,
  executeVisitorAutomation,
  generateRecurringCards,
} from "@/lib/inngest/functions"

console.log("[v0] Inngest endpoint initialized")
console.log("[v0] Inngest ID:", inngest.id)
console.log("[v0] Functions registered:", [
  sendScheduledSMS.id,
  sendNewsletterCampaign.id,
  sendEventReminder.id,
  executeVisitorAutomation.id,
  generateRecurringCards.id,
])

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendScheduledSMS,
    sendNewsletterCampaign,
    sendEventReminder,
    executeVisitorAutomation,
    generateRecurringCards,
  ],
  signingKey: process.env.INNGEST_SIGNING_KEY,
  streaming: false,
})
