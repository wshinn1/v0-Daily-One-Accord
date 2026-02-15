import * as Sentry from "@sentry/nextjs"

let sentryInitialized = false

export function initSentry() {
  if (sentryInitialized) {
    return
  }

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    })
    sentryInitialized = true
  }
}

export function captureError(error: unknown, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Convert Supabase error objects to proper Error instances
    let errorToCapture: Error

    if (error instanceof Error) {
      errorToCapture = error
    } else if (typeof error === "object" && error !== null) {
      // Handle Supabase error objects with {code, message, details, hint}
      const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string }
      const message = supabaseError.message || "Unknown error"
      errorToCapture = new Error(message)

      // Add Supabase-specific properties to the error context
      if (context) {
        context.supabaseError = {
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
        }
      } else {
        context = {
          supabaseError: {
            code: supabaseError.code,
            details: supabaseError.details,
            hint: supabaseError.hint,
          },
        }
      }
    } else {
      // Handle primitive values or other types
      errorToCapture = new Error(String(error))
    }

    Sentry.captureException(errorToCapture, {
      extra: context,
    })
  }
}

export function setUserContext(user: { id: string; email?: string; role?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  }
}
