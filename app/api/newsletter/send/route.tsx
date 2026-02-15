import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError, AuthenticationError, ExternalAPIError } from "@/lib/errors/types"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"

export const POST = asyncHandler(async (request: NextRequest) => {
  // <CHANGE> Add rate limiting for email sending
  const rateLimitResult = await withRateLimit(request, rateLimiters.email)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }
  // </CHANGE>

  const { newsletterId, recipients, subject, content } = await request.json()

// ... existing code ...
})
