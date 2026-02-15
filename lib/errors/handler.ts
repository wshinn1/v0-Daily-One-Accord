import { NextResponse } from "next/server"
import {
  AppError,
  ErrorCode,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  IntegrationError,
  AuthorizationError,
  ExternalAPIError,
} from "./types"
import { logErrorToDatabase } from "./database-logger"
import { captureError } from "./sentry"
import { monitorApiPerformance } from "./performance-monitor"

export {
  AuthenticationError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  IntegrationError,
  AuthorizationError,
  ExternalAPIError,
  AppError,
  ErrorCode,
}

export { AuthenticationError as UnauthorizedError }

interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: any
    timestamp: string
    requestId?: string
  }
}

export class ErrorHandler {
  static async handle(
    error: unknown,
    requestId?: string,
    context?: {
      userId?: string
      tenantId?: string
      path?: string
      method?: string
      userAgent?: string
    },
  ): Promise<NextResponse<ErrorResponse>> {
    console.error("[v0] Error occurred:", {
      error,
      requestId,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Log to Sentry
    if (error instanceof Error) {
      captureError(error, { requestId, ...context })
    }

    // Log to database
    if (error instanceof AppError && context) {
      await logErrorToDatabase(error, context).catch(console.error)
    }

    // Handle known AppError instances
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: error.statusCode },
      )
    }

    // Handle Supabase errors
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error, requestId)
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: "Validation failed",
            details: error,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 400 },
      )
    }

    // Handle authorization errors
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: "Unauthorized access",
            details: error.details,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 403 },
      )
    }

    // Handle external API errors
    if (error instanceof ExternalAPIError) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.EXTERNAL_API_ERROR,
            message: "Error from external API",
            details: error.details,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: error.statusCode || 500 },
      )
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message:
            process.env.NODE_ENV === "production"
              ? "An unexpected error occurred"
              : error instanceof Error
                ? error.message
                : "Unknown error",
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 },
    )
  }

  private static isSupabaseError(error: any): boolean {
    return error && typeof error === "object" && "code" in error && "message" in error
  }

  private static handleSupabaseError(error: any, requestId?: string): NextResponse<ErrorResponse> {
    const statusCode = error.code === "PGRST116" ? 404 : 500
    const errorCode = error.code === "PGRST116" ? ErrorCode.RECORD_NOT_FOUND : ErrorCode.DATABASE_ERROR

    return NextResponse.json(
      {
        error: {
          code: errorCode,
          message: error.message || "Database error occurred",
          details: { supabaseCode: error.code },
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: statusCode },
    )
  }

  private static isValidationError(error: any): boolean {
    return error && typeof error === "object" && "issues" in error
  }
}

export function asyncHandler(handler: (request: Request, context?: any) => Promise<NextResponse>) {
  return async (request: Request, context?: any) => {
    const startTime = Date.now()
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

    try {
      const response = await handler(request, context)

      // Monitor API performance
      const endTime = Date.now()
      monitorApiPerformance(new URL(request.url).pathname, startTime, endTime)

      return response
    } catch (error) {
      const errorContext = {
        path: new URL(request.url).pathname,
        method: request.method,
        userAgent: request.headers.get("user-agent") || undefined,
      }

      return ErrorHandler.handle(error, requestId, errorContext)
    }
  }
}

export async function handleError(
  error: unknown,
  request: Request,
  context?: {
    userId?: string
    tenantId?: string
  },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()
  const errorContext = {
    path: new URL(request.url).pathname,
    method: request.method,
    userAgent: request.headers.get("user-agent") || undefined,
    ...context,
  }

  return ErrorHandler.handle(error, requestId, errorContext)
}
