import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

// Define the main app domain (production and preview)
const MAIN_DOMAINS = [
  "tektonstable.com",
  "www.tektonstable.com",
  "localhost:3000",
  "localhost",
]

// Paths that should always be accessible on subdomains
const PUBLIC_TENANT_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/join",
  "/give",
  "/register",
  "/embed",
]

// Paths that require authentication on tenant subdomains
const PROTECTED_TENANT_PATHS = [
  "/dashboard",
]

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const pathname = request.nextUrl.pathname

  // Check if this is a Vercel preview URL or main domain
  const isVercelPreview = hostname.includes("vercel.app") || hostname.includes("v0.dev")
  const isMainDomain = MAIN_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))

  // Extract subdomain for tenant routing
  let subdomain: string | null = null

  if (!isVercelPreview && !isMainDomain) {
    // Extract subdomain from hostname (e.g., "savefeedrestore" from "savefeedrestore.tektonstable.com")
    const parts = hostname.split(".")
    if (parts.length >= 3) {
      // Remove www if present
      subdomain = parts[0] === "www" ? parts[1] : parts[0]
    } else if (parts.length === 2 && !hostname.includes("localhost")) {
      // For cases like subdomain.domain.com without www
      subdomain = parts[0]
    }
  }

  // If this is a tenant subdomain request
  if (subdomain && subdomain !== "www") {
    // Update Supabase session
    const { supabaseResponse, user } = await updateSession(request)

    // Check if this is a protected path
    const isProtectedPath = PROTECTED_TENANT_PATHS.some((path) => pathname.startsWith(path))
    const isPublicPath = PUBLIC_TENANT_PATHS.some((path) => pathname.startsWith(path))

    // Root path on subdomain should redirect to login or dashboard
    if (pathname === "/" || pathname === "") {
      if (user) {
        // User is logged in, redirect to dashboard
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        const redirectResponse = NextResponse.redirect(url)
        // Copy cookies from supabaseResponse
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      } else {
        // User is not logged in, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        const redirectResponse = NextResponse.redirect(url)
        // Copy cookies from supabaseResponse
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        return redirectResponse
      }
    }

    // Protect dashboard routes
    if (isProtectedPath && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", pathname)
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Add tenant slug to request headers for downstream use
    const response = supabaseResponse
    response.headers.set("x-tenant-slug", subdomain)

    return response
  }

  // For main domain, just update the session
  const { supabaseResponse, user } = await updateSession(request)

  // Protect dashboard on main domain too
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Protect super-admin routes
  if (pathname.startsWith("/super-admin") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes that handle their own auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
