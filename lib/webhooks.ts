import crypto from "crypto"

export type WebhookEvent =
  | "member.created"
  | "member.updated"
  | "member.deleted"
  | "attendance.recorded"
  | "event.created"
  | "event.updated"
  | "class.enrolled"
  | "sms.sent"
  | "newsletter.sent"

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: any
  tenant_id: string
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export async function triggerWebhook(
  webhookUrl: string,
  secret: string,
  event: WebhookEvent,
  data: any,
  tenantId: string,
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      tenant_id: tenantId,
    }

    const payloadString = JSON.stringify(payload)
    const signature = generateWebhookSignature(payloadString, secret)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "User-Agent": "DailyOneAccord-Webhooks/1.0",
      },
      body: payloadString,
    })

    return {
      success: response.ok,
      status: response.status,
    }
  } catch (error) {
    console.error("[v0] Webhook delivery error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deliverWebhooks(event: WebhookEvent, data: any, tenantId: string) {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get active webhooks for this tenant and event
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .eq("is_active", true)
      .contains("events", [event])

    if (!webhooks || webhooks.length === 0) {
      return
    }

    // Deliver to each webhook
    for (const webhook of webhooks) {
      const result = await triggerWebhook(webhook.url, webhook.secret, event, data, tenantId)

      // Log delivery
      await supabase.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event_type: event,
        payload: { event, data, tenant_id: tenantId },
        response_status: result.status,
        success: result.success,
        error_message: result.error,
      })

      // Update webhook stats
      if (result.success) {
        await supabase
          .from("webhooks")
          .update({
            last_triggered_at: new Date().toISOString(),
            failure_count: 0,
          })
          .eq("id", webhook.id)
      } else {
        await supabase
          .from("webhooks")
          .update({
            failure_count: webhook.failure_count + 1,
          })
          .eq("id", webhook.id)

        // Disable webhook after 10 consecutive failures
        if (webhook.failure_count >= 9) {
          await supabase.from("webhooks").update({ is_active: false }).eq("id", webhook.id)
        }
      }
    }
  } catch (error) {
    console.error("[v0] Webhook delivery error:", error)
  }
}
