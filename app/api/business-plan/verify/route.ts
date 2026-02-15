import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { handleError, AuthenticationError } from "@/lib/errors/handler"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      throw new AuthenticationError("No session token provided")
    }

    const supabase = await getSupabaseServiceRoleClient()

    // Find session and verify it's not expired
    const { data: session, error: sessionError } = await supabase
      .from("business_plan_sessions")
      .select("*, business_plan_users(*)")
      .eq("session_token", sessionToken)
      .single()

    if (!session || sessionError) {
      throw new AuthenticationError("Invalid session")
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from("business_plan_sessions").delete().eq("id", session.id)
      throw new AuthenticationError("Session expired")
    }

    const user = session.business_plan_users

    if (!user || !user.access_granted) {
      throw new AuthenticationError("Access denied")
    }

    // Update last used timestamp
    await supabase
      .from("business_plan_sessions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", session.id)

    // Check if NDA is required
    const ndaSystemImplementedDate = new Date("2025-01-22")
    const userCreatedDate = new Date(user.created_at)
    const requiresNDA = userCreatedDate >= ndaSystemImplementedDate

    if (requiresNDA) {
      const { data: ndaSignature } = await supabase.from("nda_signatures").select("id").eq("user_id", user.id).single()

      if (!ndaSignature) {
        return NextResponse.json({
          requiresNDA: true,
        })
      }
    }

    // Log access
    await supabase.from("business_plan_access_logs").insert({
      user_id: user.id,
      accessed_at: new Date().toISOString(),
    })

    return NextResponse.json({
      requiresNDA: false,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    return handleError(error, request)
  }
}
