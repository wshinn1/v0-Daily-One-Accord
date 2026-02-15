import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { handleError, AuthenticationError, ValidationError } from "@/lib/errors/handler"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Business plan login attempt for:", email)

    if (!email || !password) {
      throw new ValidationError("Email and password are required")
    }

    const supabase = await getSupabaseServiceRoleClient()

    // Find user in business_plan_users table
    const { data: user, error: userError } = await supabase
      .from("business_plan_users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (!user || userError) {
      console.log("[v0] User not found")
      throw new AuthenticationError("Invalid email or password")
    }

    if (!user.access_granted) {
      console.log("[v0] Access revoked")
      throw new AuthenticationError("Access has been revoked. Please contact the administrator.")
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password.trim(), user.password_hash)

    if (!passwordMatch) {
      console.log("[v0] Password mismatch")
      throw new AuthenticationError("Invalid email or password")
    }

    console.log("[v0] Login successful")

    // Update last login
    await supabase.from("business_plan_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)

    // Log access
    await supabase.from("business_plan_access_logs").insert({
      user_id: user.id,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    const sessionToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store session token in database
    await supabase.from("business_plan_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    console.log("[v0] Session token generated, returning to client")

    // Return the session token to be stored in localStorage
    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("[v0] Business plan login error:", error)
    return handleError(error, request)
  }
}
