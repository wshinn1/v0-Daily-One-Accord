import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const payload = await request.json()

  console.log("[v0] Telnyx webhook received:", payload.data?.event_type)

  const eventType = payload.data?.event_type
  const messageData = payload.data?.payload

  if (!eventType || !messageData) {
    throw new ValidationError("Invalid webhook payload - missing event_type or payload")
  }

  // Handle different event types
  switch (eventType) {
    case "message.sent":
      await updateMessageStatus(supabase, messageData.id, "sent")
      break

    case "message.delivered":
      await updateMessageStatus(supabase, messageData.id, "delivered")
      break

    case "message.delivery_failed":
      await updateMessageStatus(supabase, messageData.id, "failed", messageData.errors?.[0]?.detail)
      break

    case "message.received":
      await handleIncomingMessage(supabase, messageData)
      break

    default:
      console.log("[v0] Unhandled Telnyx event type:", eventType)
  }

  return NextResponse.json({ received: true })
})

async function updateMessageStatus(supabase: any, messageId: string, status: string, errorMessage?: string) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  const { error } = await supabase.from("sms_logs").update(updateData).eq("message_id", messageId)

  if (error) {
    throw new DatabaseError("Failed to update SMS status", { originalError: error })
  }

  console.log(`[v0] Updated SMS ${messageId} status to ${status}`)
}

async function handleIncomingMessage(supabase: any, messageData: any) {
  const { error } = await supabase.from("sms_logs").insert({
    church_tenant_id: null,
    to_number: messageData.to[0]?.phone_number,
    from_number: messageData.from?.phone_number,
    message: messageData.text,
    status: "received",
    message_id: messageData.id,
    direction: "inbound",
  })

  if (error) {
    throw new DatabaseError("Failed to log incoming SMS", { originalError: error })
  }

  console.log("[v0] Logged incoming SMS from", messageData.from?.phone_number)
}
