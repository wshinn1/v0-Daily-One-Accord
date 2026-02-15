import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler, AuthenticationError, ValidationError, DatabaseError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: Request) => {
  const { churchId, clientId, clientSecret } = await request.json()

  if (!churchId || !clientId || !clientSecret) {
    throw new ValidationError("Missing required fields")
  }

  const supabase = await createServerClient()

  // Verify user is authenticated and has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User not authenticated")
  }

  // Update church tenant with Slack credentials
  const { error } = await supabase
    .from("church_tenants")
    .update({
      slack_client_id: clientId,
      slack_client_secret: clientSecret,
    })
    .eq("id", churchId)

  if (error) {
    console.error("Error saving Slack credentials:", error)
    throw new DatabaseError("Failed to save credentials")
  }

  return NextResponse.json({ success: true })
})
