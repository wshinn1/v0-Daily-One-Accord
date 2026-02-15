import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError, AuthenticationError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError("User not authenticated")
  }

  // Get the update data from the request
  const { full_name, phone } = await request.json()

  // Validate required fields
  if (!full_name || full_name.trim() === "") {
    throw new ValidationError("Full name is required")
  }

  // Update the user profile
  const { error: updateError } = await supabase
    .from("users")
    .update({
      full_name: full_name.trim(),
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    throw new DatabaseError("Failed to update profile", { cause: updateError })
  }

  return NextResponse.json({ success: true })
})
