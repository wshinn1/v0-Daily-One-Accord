import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler, AuthenticationError, ValidationError, DatabaseError } from "@/lib/errors/handler"

export const DELETE = asyncHandler(async (request: Request, { params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to delete events")
  }

  const { data: event } = await supabase.from("events").select("is_default_service").eq("id", eventId).single()

  if (event?.is_default_service) {
    throw new ValidationError("Cannot delete default church service event")
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId)

  if (error) {
    console.error("[v0] Error deleting event:", error)
    throw new DatabaseError("Failed to delete event", error)
  }

  return NextResponse.json({ success: true })
})
