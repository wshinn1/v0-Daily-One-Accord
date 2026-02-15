import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, DatabaseError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { churchTenantId, message, recipientType, eventId, scheduledFor } = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to schedule SMS")
  }

  const { data, error } = await supabase
    .from("scheduled_sms")
    .insert({
      church_tenant_id: churchTenantId,
      event_id: eventId,
      message,
      recipient_type: recipientType,
      scheduled_for: scheduledFor,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error scheduling SMS:", error)
    throw new DatabaseError("Failed to schedule SMS", error)
  }

  return NextResponse.json({ success: true, data })
})
