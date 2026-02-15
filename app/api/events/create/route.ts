import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createEventSchema } from "@/lib/validation/schemas"
import { asyncHandler } from "@/lib/errors/handler"
import { ValidationError, AuthenticationError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("You must be logged in to create events")
  }

  const body = await request.json()

  const validation = createEventSchema.safeParse(body)
  if (!validation.success) {
    throw new ValidationError("Invalid event data", {
      errors: validation.error.flatten().fieldErrors,
    })
  }

  const validatedData = validation.data

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      church_tenant_id: validatedData.church_tenant_id,
      title: validatedData.title,
      description: validatedData.description,
      start_time: validatedData.start_time,
      end_time: validatedData.end_time,
      location: validatedData.location,
      event_type: validatedData.event_type,
      is_public: validatedData.is_public,
      allow_registration: validatedData.allow_registration,
      max_attendees: validatedData.max_attendees,
      leader_id: validatedData.leader_id,
      is_default_service: false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  return NextResponse.json({ event })
})
