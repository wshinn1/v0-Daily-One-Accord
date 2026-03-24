import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Get the root domain for cookie sharing across subdomains
function getCookieDomain(hostname: string): string | undefined {
  // Don't set domain for localhost or Vercel preview URLs
  if (hostname.includes("localhost") || hostname.includes("vercel.app") || hostname.includes("v0.dev")) {
    return undefined
  }
  
  // Extract root domain (e.g., "tektonstable.com" from "savefeedrestore.tektonstable.com")
  const parts = hostname.split(".")
  if (parts.length >= 2) {
    // Return the root domain with leading dot for subdomain sharing
    return `.${parts.slice(-2).join(".")}`
  }
  
  return undefined
}

/**
 * Middleware helper for Supabase authentication
 * Handles session refresh and cookie management
 * Optimized for multi-tenant architecture with cross-subdomain cookie support
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const hostname = request.headers.get("host") || ""
  const cookieDomain = getCookieDomain(hostname)

  // Create Supabase client for this request
  // Important: Don't put this in a global variable for Fluid compute
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookies with domain for cross-subdomain sharing
            const cookieOptions = {
              ...options,
              ...(cookieDomain && { domain: cookieDomain }),
            }
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
        },
      },
    },
  )

  // IMPORTANT: Do not run code between createServerClient and getUser()
  // This ensures session refresh happens correctly
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user, supabase }
}
