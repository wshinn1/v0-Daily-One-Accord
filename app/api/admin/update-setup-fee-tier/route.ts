import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const { tier } = await request.json()

  console.log("[v0] Updating setup fee tier:", tier)

  if (!["standard", "promotional", "launch"].includes(tier)) {
    throw new ValidationError("Invalid setup fee tier. Must be standard, promotional, or launch")
  }

  const supabase = await createServerClient()

  // Check if user is super admin
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new AuthenticationError("User must be authenticated to update setup fee tier")
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", userData.user.id).single()

  if (profile?.role !== "super_admin") {
    throw new AuthorizationError("Only super admins can update setup fee tier")
  }

  // Update or insert the setup fee tier configuration
  const { error } = await supabase.from("system_config").upsert(
    {
      key: "active_setup_fee_tier",
      value: tier,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  )

  if (error) {
    throw new DatabaseError("Failed to update setup fee tier", { originalError: error })
  }

  console.log("[v0] Setup fee tier updated successfully")

  return NextResponse.json({ success: true })
})
