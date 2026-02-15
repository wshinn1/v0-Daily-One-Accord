import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import {
  asyncHandler,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
  AuthorizationError,
} from "@/lib/errors/handler"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"

export const POST = asyncHandler(async (request: NextRequest) => {
  // <CHANGE> Add rate limiting for bulk SMS
  const rateLimitResult = await withRateLimit(request, rateLimiters.sms)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }
  // </CHANGE>

  const supabase = await createServerClient()

// ... existing code ...
})
