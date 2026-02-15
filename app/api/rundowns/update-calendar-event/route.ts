import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { rundownId, calendarEventId } = await request.json()

  if (!rundownId || !calendarEventId) {
    throw new ValidationError("Rundown ID and calendar event ID are required")
  }

  // Get the updated rundown details
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

  // Get all modules to recalculate duration
  const { data: modules, error: modulesError } = await supabase
    .from("rundown_modules")
    .select("*")
    .eq("rundown_id", rundownId)
    .order("order_index")

  if (modulesError) {
    throw new DatabaseError("Failed to fetch rundown modules", { cause: modulesError })
  }

  // Calculate total duration
  const totalDuration = modules?.reduce((sum, module) => sum + (module.duration_minutes || 0), 0) || 120

  // Get the first module's start time
  const firstModuleTime = modules?.[0]?.start_time || "10:00"
  const [hours, minutes] = firstModuleTime.split(":").map(Number)

  // Create start and end times
  const startTime = new Date(rundown.event_date)
  startTime.setHours(hours, minutes, 0, 0)

  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + totalDuration)

  // Update the calendar event
  const { error: updateError } = await supabase
    .from("events")
    .update({
      title: rundown.title,
      description: rundown.description || `Event rundown: ${rundown.title}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    })
    .eq("id", calendarEventId)

  if (updateError) {
    throw new DatabaseError("Failed to update calendar event", { cause: updateError })
  }

  return NextResponse.json({ success: true })
})
