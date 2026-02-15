import type { NextRequest } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { AuthenticationError, NotFoundError } from "@/lib/errors/types"
import { Logger } from "@/lib/errors/logger"
import { validateRequired, validateEmail } from "@/lib/errors/validation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Example API route with proper error handling
export const POST = asyncHandler(async (request: NextRequest) => {
  const requestId = crypto.randomUUID()
  Logger.info("API request started", { requestId, path: request.url })

  // Parse and validate request body
  const body = await request.json()

  validateRequired(body.email, "Email")
  validateEmail(body.email)
  validateRequired(body.name, "Name")

  // Get authenticated user
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthenticationError("User not authenticated")
  }

  // Perform database operation
  const { data, error } = await supabase.from("some_table").select("*").eq("id", body.id).single()

  if (error) {
    Logger.error("Database query failed", error, { requestId, userId: user.id })
    throw new NotFoundError("Record")
  }

  Logger.info("API request completed successfully", { requestId, userId: user.id })

  return Response.json({ success: true, data })
})
