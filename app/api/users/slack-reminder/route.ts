import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { ValidationError, DatabaseError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { userId, tenantId } = await request.json()

  if (!userId || !tenantId) {
    throw new ValidationError("Missing required fields: userId or tenantId")
  }

  // Update the slack_reminded_at timestamp
  const { error } = await supabase
    .from("church_members")
    .update({
      slack_reminded_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("church_tenant_id", tenantId)

  if (error) {
    throw new DatabaseError("Failed to update slack reminder timestamp", { originalError: error })
  }

  return NextResponse.json({ success: true })
})
