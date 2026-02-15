import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import {
  asyncHandler,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
  AuthorizationError,
} from "@/lib/errors/handler"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"

export const POST = asyncHandler(async (request: NextRequest) => {
  const rateLimitResult = await withRateLimit(request, rateLimiters.sms)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new AuthenticationError("User must be authenticated to send SMS")
  }

  const body = await request.json()
  const { churchTenantId, to, message, recipientType, recipientId } = body

  console.log("[v0] SMS send request:", { churchTenantId, to, recipientType })

  if (!churchTenantId || !to || !message) {
    throw new ValidationError("Missing required fields: churchTenantId, to, message")
  }

  const { data: membership } = await supabase
    .from("church_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("church_tenant_id", churchTenantId)
    .single()

  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  const isSuperAdmin = userData?.is_super_admin === true
  const canSendSMS = isSuperAdmin || ["lead_admin", "admin", "pastor", "staff"].includes(membership?.role || "")

  if (!canSendSMS) {
    throw new AuthorizationError("Insufficient permissions to send SMS")
  }

  // Get church SMS configuration
  const { data: church, error: churchError } = await supabase
    .from("church_tenants")
    .select("sms_phone_number, sms_messaging_profile_id, sms_enabled, name")
    .eq("id", churchTenantId)
    .single()

  if (churchError || !church) {
    console.error("[v0] Church not found:", churchError)
    throw new DatabaseError("Church not found", churchError)
  }

  if (!church.sms_enabled || !church.sms_phone_number) {
    throw new ValidationError("SMS is not configured for this church. Please configure SMS in settings.")
  }

  const telnyxApiKey = process.env.TELNYX_API_KEY
  if (!telnyxApiKey) {
    console.error("[v0] TELNYX_API_KEY not configured")
    throw new ExternalAPIError("SMS service not configured. Please contact support.", "Telnyx")
  }

  console.log("[v0] Sending SMS via Telnyx...")

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
    console.error("[v0] Telnyx API error:", telnyxData)

    // Log failed SMS
    await supabase.from("sms_logs").insert({
      church_tenant_id: churchTenantId,
      to_phone: to,
      from_phone: church.sms_phone_number,
      message: message,
      status: "failed",
      sent_by: user.id,
      recipient_type: recipientType,
      recipient_id: recipientId,
      error_message: JSON.stringify(telnyxData),
    })

    throw new ExternalAPIError(`Failed to send SMS: ${telnyxData.errors?.[0]?.detail || "Unknown error"}`, "Telnyx")
  }

  console.log("[v0] SMS sent successfully:", telnyxData.data?.id)

  // Log successful SMS
  const { error: logError } = await supabase.from("sms_logs").insert({
    church_tenant_id: churchTenantId,
    to_phone: to,
    from_phone: church.sms_phone_number,
    message: message,
    status: "sent",
    telnyx_message_id: telnyxData.data?.id,
    sent_by: user.id,
    recipient_type: recipientType,
    recipient_id: recipientId,
  })

  if (logError) {
    console.error("[v0] Failed to log SMS:", logError)
  }

  return NextResponse.json({
    success: true,
    messageId: telnyxData.data?.id,
    message: "SMS sent successfully",
  })
})
