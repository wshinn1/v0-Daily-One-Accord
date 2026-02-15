import { inngest } from "./client"
import { sendSMS } from "@/lib/sms"
import { sendEmail } from "@/lib/email"

// Scheduled SMS with automatic retries
export const sendScheduledSMS = inngest.createFunction(
  { id: "send-scheduled-sms", retries: 3 },
  { event: "sms/scheduled" },
  async ({ event, step }) => {
    const { recipients, message, tenantId } = event.data

    // Step 1: Validate recipients
    const validRecipients = await step.run("validate-recipients", async () => {
      return recipients.filter((r: any) => r.phone && r.phone.length > 0)
    })

    // Step 2: Send SMS (with automatic retries per step)
    const results = await step.run("send-sms", async () => {
      return await Promise.all(validRecipients.map((recipient: any) => sendSMS(recipient.phone, message, tenantId)))
    })

    return { sent: results.length, recipients: validRecipients.length }
  },
)

// Newsletter campaign with batching
export const sendNewsletterCampaign = inngest.createFunction(
  { id: "send-newsletter-campaign", retries: 3 },
  { event: "newsletter/send" },
  async ({ event, step }) => {
    const { recipients, subject, content, tenantId } = event.data

    // Step 1: Batch recipients (50 at a time)
    const batches = await step.run("create-batches", async () => {
      const batchSize = 50
      const result = []
      for (let i = 0; i < recipients.length; i += batchSize) {
        result.push(recipients.slice(i, i + batchSize))
      }
      return result
    })

    // Step 2: Send each batch with delay
    for (let i = 0; i < batches.length; i++) {
      await step.run(`send-batch-${i}`, async () => {
        return await Promise.all(
          batches[i].map((recipient: any) =>
            sendEmail({
              to: recipient.email,
              subject,
              html: content,
            }),
          ),
        )
      })

      // Wait 1 second between batches to avoid rate limits
      if (i < batches.length - 1) {
        await step.sleep("rate-limit-delay", "1s")
      }
    }

    return { sent: recipients.length, batches: batches.length }
  },
)

// Automated reminder emails
export const sendEventReminder = inngest.createFunction(
  { id: "send-event-reminder" },
  { cron: "0 9 * * *" }, // Run daily at 9 AM
  async ({ step }) => {
    // Step 1: Find events happening tomorrow
    const upcomingEvents = await step.run("find-upcoming-events", async () => {
      // Query your database for events happening in 24 hours
      return []
    })

    // Step 2: Send reminders
    await step.run("send-reminders", async () => {
      // Send reminder emails to attendees
      return upcomingEvents.length
    })
  },
)

// Visitor automation execution function
export const executeVisitorAutomation = inngest.createFunction(
  { id: "execute-visitor-automation", retries: 2 },
  { event: "visitor/automation.trigger" },
  async ({ event, step }) => {
    const { visitorId, automationId, tenantId, triggerType } = event.data

    console.log("[v0] Executing automation:", { visitorId, automationId, triggerType })

    // Step 1: Fetch automation details
    const automation = await step.run("fetch-automation", async () => {
      const { createServiceRoleClient } = await import("@/lib/supabase/service-role")
      const supabase = createServiceRoleClient()

      const { data, error } = await supabase
        .from("visitor_automations")
        .select("*")
        .eq("id", automationId)
        .eq("is_active", true)
        .single()

      if (error) throw new Error(`Failed to fetch automation: ${error.message}`)
      return data
    })

    if (!automation) {
      console.log("[v0] Automation not found or inactive")
      return { success: false, reason: "Automation not found or inactive" }
    }

    // Step 2: Execute the action
    const result = await step.run("execute-action", async () => {
      const { createServiceRoleClient } = await import("@/lib/supabase/service-role")
      const supabase = createServiceRoleClient()

      try {
        switch (automation.action_type) {
          case "assign_to_user": {
            const { user_id } = automation.action_config
            await supabase.from("visitors").update({ assigned_to: user_id }).eq("id", visitorId)
            return { success: true, action: "assigned_to_user", user_id }
          }

          case "move_to_status": {
            const { status } = automation.action_config
            await supabase.from("visitors").update({ status }).eq("id", visitorId)
            return { success: true, action: "moved_to_status", status }
          }

          case "send_slack_notification": {
            const { channel_id, message } = automation.action_config
            // Trigger Slack notification
            await inngest.send({
              name: "slack/send.message",
              data: { tenantId, channelId: channel_id, message, visitorId },
            })
            return { success: true, action: "sent_slack_notification" }
          }

          case "add_label": {
            const { label_id } = automation.action_config
            await supabase.from("visitor_label_assignments").insert({ visitor_id: visitorId, label_id })
            return { success: true, action: "added_label", label_id }
          }

          default:
            throw new Error(`Unknown action type: ${automation.action_type}`)
        }
      } catch (error: any) {
        throw new Error(`Action execution failed: ${error.message}`)
      }
    })

    // Step 3: Log execution
    await step.run("log-execution", async () => {
      const { createServiceRoleClient } = await import("@/lib/supabase/service-role")
      const supabase = createServiceRoleClient()

      await supabase.from("visitor_automation_logs").insert({
        automation_id: automationId,
        visitor_id: visitorId,
        success: result.success,
        execution_data: result,
      })
    })

    return result
  },
)

// Recurring cards generation function
export const generateRecurringCards = inngest.createFunction(
  { id: "generate-recurring-cards" },
  { cron: "0 * * * *" }, // Run every hour
  async ({ step }) => {
    console.log("[v0] Checking for recurring cards to generate")

    // Step 1: Find templates that need to generate cards
    const templates = await step.run("find-due-templates", async () => {
      const { createServiceRoleClient } = await import("@/lib/supabase/service-role")
      const supabase = createServiceRoleClient()

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from("visitor_recurring_templates")
        .select("*")
        .eq("is_active", true)
        .lte("next_generation_at", now)

      if (error) {
        console.error("[v0] Error fetching templates:", error)
        return []
      }

      return data || []
    })

    console.log("[v0] Found", templates.length, "templates to process")

    // Step 2: Generate cards for each template
    for (const template of templates) {
      await step.run(`generate-card-${template.id}`, async () => {
        const { createServiceRoleClient } = await import("@/lib/supabase/service-role")
        const supabase = createServiceRoleClient()

        try {
          // Create visitor card from template
          const cardData = {
            church_tenant_id: template.church_tenant_id,
            full_name: template.card_template.full_name || "Follow-up Task",
            email: template.card_template.email || "",
            phone: template.card_template.phone || "",
            status: template.card_template.status || "new",
            assigned_to: template.card_template.assigned_to || null,
            notes: template.card_template.notes || `Generated from recurring template: ${template.name}`,
            due_date: template.card_template.due_date || null,
          }

          const { data: visitor, error: visitorError } = await supabase
            .from("visitors")
            .insert(cardData)
            .select()
            .single()

          if (visitorError) throw visitorError

          // Track the generated instance
          await supabase.from("visitor_recurring_instances").insert({
            template_id: template.id,
            visitor_id: visitor.id,
          })

          // Calculate next generation time
          const nextGeneration = calculateNextGeneration(
            template.recurrence_type,
            template.recurrence_interval,
            template.recurrence_day_of_week,
            template.recurrence_day_of_month,
          )

          // Update template
          await supabase
            .from("visitor_recurring_templates")
            .update({
              last_generated_at: new Date().toISOString(),
              next_generation_at: nextGeneration,
            })
            .eq("id", template.id)

          console.log("[v0] Generated card for template:", template.name)

          return { success: true, visitorId: visitor.id }
        } catch (error: any) {
          console.error("[v0] Error generating card:", error)
          return { success: false, error: error.message }
        }
      })
    }

    return { processed: templates.length }
  },
)

function calculateNextGeneration(type: string, interval: number, dayOfWeek?: number, dayOfMonth?: number): string {
  const now = new Date()

  switch (type) {
    case "daily":
      now.setDate(now.getDate() + interval)
      break
    case "weekly":
      const daysUntilTarget = ((dayOfWeek || 0) - now.getDay() + 7) % 7
      now.setDate(now.getDate() + (daysUntilTarget || 7 * interval))
      break
    case "monthly":
      now.setMonth(now.getMonth() + interval)
      if (dayOfMonth) {
        now.setDate(dayOfMonth)
      }
      break
  }

  return now.toISOString()
}
