import { createServerClient } from "@/lib/supabase/server"

export async function sendSMS(to: string, message: string, churchTenantId: string) {
  const supabase = await createServerClient()

  // Get church SMS configuration
  const { data: church, error: churchError } = await supabase
    .from("church_tenants")
    .select("sms_phone_number, sms_messaging_profile_id, sms_enabled")
    .eq("id", churchTenantId)
    .single()

  if (churchError || !church) {
    throw new Error(`Church not found: ${churchError?.message}`)
  }

  if (!church.sms_enabled || !church.sms_phone_number) {
    throw new Error("SMS is not configured for this church")
  }

  const telnyxApiKey = process.env.TELNYX_API_KEY
  if (!telnyxApiKey) {
    throw new Error("TELNYX_API_KEY not configured")
  }

  // Send SMS via Telnyx API
  const telnyxResponse = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${telnyxApiKey}`,
    },
    body: JSON.stringify({
      from: church.sms_phone_number,
      to: to,
      text: message,
      messaging_profile_id: church.sms_messaging_profile_id || undefined,
    }),
  })

  const telnyxData = await telnyxResponse.json()

  if (!telnyxResponse.ok) {
    throw new Error(`Failed to send SMS: ${telnyxData.errors?.[0]?.detail || "Unknown error"}`)
  }

  // Log SMS
  await supabase.from("sms_logs").insert({
    church_tenant_id: churchTenantId,
    to_phone: to,
    from_phone: church.sms_phone_number,
    message: message,
    status: "sent",
    telnyx_message_id: telnyxData.data?.id,
  })

  return {
    success: true,
    messageId: telnyxData.data?.id,
  }
}
