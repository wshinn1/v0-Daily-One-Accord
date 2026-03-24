import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Get the root domain for cookie sharing across subdomains
function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined
  
  const hostname = window.location.hostname
  
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

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? "present" : "missing",
      key: supabaseAnonKey ? "present" : "missing",
    })
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  const cookieDomain = getCookieDomain()

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Custom cookie options for cross-subdomain support
      ...(cookieDomain && {
        get(name: string) {
          const cookies = document.cookie.split(";")
          const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined
        },
        set(name: string, value: string, options: any) {
          let cookieString = `${name}=${encodeURIComponent(value)}`
          if (cookieDomain) cookieString += `; domain=${cookieDomain}`
          if (options?.path) cookieString += `; path=${options.path}`
          else cookieString += `; path=/`
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
          if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`
          else cookieString += `; samesite=lax`
          if (options?.secure || window.location.protocol === "https:") cookieString += `; secure`
          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          if (cookieDomain) cookieString += `; domain=${cookieDomain}`
          if (options?.path) cookieString += `; path=${options.path}`
          else cookieString += `; path=/`
          document.cookie = cookieString
        },
      }),
    },
  })
}

export function getSupabaseBrowserClient() {
  return createClient()
}

export function createBrowserClient() {
  return createClient()
}
