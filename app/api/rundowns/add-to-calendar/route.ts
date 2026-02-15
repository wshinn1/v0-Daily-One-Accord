import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { rundownId } = await request.json()

  if (!rundownId) {
    throw new ValidationError("Rundown ID is required")
  }

  // Get the rundown details
  const { data: rundown, error: rundownError } = await supabase
    .from("event_rundowns")
    .select("*")
    .eq("id", rundownId)
    .single()

  if (rundownError) {
    throw new DatabaseError("Failed to fetch rundown", { cause: rundownError })
  }

  if (!rundown) {
    throw new ValidationError("Rundown not found")
  }

  // Get all modules for this rundown to calculate event duration
  const { data: modules, error: modulesError } = await supabase
    .from("rundown_modules")
    .select("*")
    .eq("rundown_id", rundownId)
    .order("order_index")

  if (modulesError) {
    throw new DatabaseError("Failed to fetch rundown modules", { cause: modulesError })
  }

  // Calculate total duration from modules
  const totalDuration = modules?.reduce((sum, module) => sum + (module.duration_minutes || 0), 0) || 120 // Default 2 hours

  // Get the first module's start time or default to 10:00 AM
  const firstModuleTime = modules?.[0]?.start_time || "10:00"
  const [hours, minutes] = firstModuleTime.split(":").map(Number)

  // Create start and end times
  const startTime = new Date(rundown.event_date)
  startTime.setHours(hours, minutes, 0, 0)

  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + totalDuration)

  // Create calendar event
  const { data: calendarEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      church_tenant_id: rundown.church_tenant_id,
      title: rundown.title,
      description: rundown.description || `Event rundown: ${rundown.title}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      is_public: false,
      allow_registration: false,
    })
    .select()
    .single()

  if (eventError) {
    throw new DatabaseError("Failed to create calendar event", { cause: eventError })
  }

  // Update rundown to mark it as added to calendar
  const { error: updateError } = await supabase
    .from("event_rundowns")
    .update({
      added_to_calendar: true,
      calendar_event_id: calendarEvent.id,
    })
    .eq("id", rundownId)

  if (updateError) {
    throw new DatabaseError("Failed to update rundown", { cause: updateError })
  }

  return NextResponse.json({ success: true, eventId: calendarEvent.id })
})
