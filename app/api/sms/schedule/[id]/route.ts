import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, DatabaseError } from "@/lib/errors/handler"

export const DELETE = asyncHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to cancel scheduled SMS")
  }

  const { error } = await supabase.from("scheduled_sms").update({ status: "cancelled" }).eq("id", id)

  if (error) {
    console.error("[v0] Error cancelling scheduled SMS:", error)
    throw new DatabaseError("Failed to cancel scheduled SMS", error)
  }

  return NextResponse.json({ success: true })
})
