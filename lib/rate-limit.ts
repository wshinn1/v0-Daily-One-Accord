import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize Redis client with Upstash KV credentials
const redis = new Redis({
  url: process.env["UPSTASH-KV_KV_REST_API_URL"] || "",
  token: process.env["UPSTASH-KV_KV_REST_API_TOKEN"] || "",
})

// Rate limit configurations for different endpoint types
export const rateLimiters = {
  // Strict limits for authentication endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // Moderate limits for invitation endpoints
  invitations: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 invitations per hour
    analytics: true,
    prefix: "ratelimit:invitations",
  }),

  // Strict limits for SMS sending
  sms: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 SMS per hour
    analytics: true,
    prefix: "ratelimit:sms",
  }),

  // Moderate limits for email sending
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"), // 50 emails per hour
    analytics: true,
    prefix: "ratelimit:email",
  }),

  // Generous limits for general API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
    prefix: "ratelimit:api",
  }),

  // Very strict limits for signup
  signup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 signups per hour per IP
    analytics: true,
    prefix: "ratelimit:signup",
  }),
}

// Helper function to get client identifier (IP address or user ID)
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with Vercel)
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"

  // Could also use user ID if authenticated, but IP is safer for public endpoints
  return ip
}

// Wrapper function to apply rate limiting to API routes
export async function withRateLimit(
  request: Request,
  limiter: Ratelimit,
  identifier?: string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | Response> {
  const clientId = identifier || getClientIdentifier(request)

  const { success, limit, remaining, reset } = await limiter.limit(clientId)

  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        limit,
        remaining: 0,
        reset: new Date(reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  return { success, limit, remaining, reset }
}

export async function checkRateLimit(
  request: Request,
  type: keyof typeof rateLimiters,
  customLimit?: number,
  customWindow?: number,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = rateLimiters[type]
  const clientId = getClientIdentifier(request)

  const result = await limiter.limit(clientId)

  return result
}
