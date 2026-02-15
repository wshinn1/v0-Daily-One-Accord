import { createClient } from "@/lib/supabase/server"
import type { AppError } from "./types"

export async function logErrorToDatabase(
  error: AppError,
  context: {
    userId?: string
    tenantId?: string
    path?: string
    method?: string
    userAgent?: string
  },
) {
  try {
    const supabase = await createClient()

    await supabase.from("error_logs").insert({
      error_type: error.name,
      message: error.message,
      stack_trace: error.stack,
      metadata: error.metadata,
      user_id: context.userId,
      tenant_id: context.tenantId,
      path: context.path,
      method: context.method,
      user_agent: context.userAgent,
      severity: getSeverity(error),
      created_at: new Date().toISOString(),
    })
  } catch (dbError) {
    // Fallback to console if database logging fails
    console.error("[v0] Failed to log error to database:", dbError)
  }
}

function getSeverity(error: AppError): string {
  if (error.name === "AuthenticationError" || error.name === "AuthorizationError") {
    return "warning"
  }
  if (error.name === "ValidationError") {
    return "info"
  }
  return "error"
}
