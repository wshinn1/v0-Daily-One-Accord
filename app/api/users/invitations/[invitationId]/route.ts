import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { AuthenticationError, DatabaseError } from "@/lib/errors/types"

export const DELETE = asyncHandler(async (request: NextRequest, { params }: { params: { invitationId: string } }) => {
  const supabase = await createServerClient()

  // Verify the user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to cancel invitations")
  }

  // Delete the invitation
  const { error } = await supabase.from("user_invitations").delete().eq("id", params.invitationId)

  if (error) {
    throw new DatabaseError("Failed to cancel invitation", { originalError: error })
  }

  return NextResponse.json({ success: true })
})
