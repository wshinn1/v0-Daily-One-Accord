import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const { churchId, botToken } = await request.json()

  if (!churchId || !botToken) {
    throw new ValidationError("Church ID and bot token are required")
  }

  if (!botToken.startsWith("xoxb-")) {
    throw new ValidationError("Invalid bot token format")
  }

  const supabase = await createServerClient()

  // Update the church tenant with the bot token
  const { error: updateError } = await supabase
    .from("church_tenants")
    .update({
      slack_bot_token: botToken,
      slack_oauth_configured: true,
    })
    .eq("id", churchId)

  if (updateError) {
    console.error("[v0] Error saving bot token:", updateError)
    throw new DatabaseError("Failed to save bot token")
  }

  return NextResponse.json({ success: true })
})
