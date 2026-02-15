import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("[v0] Stripe Connect status API - Starting")

  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] User:", user?.id, "Error:", userError)

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()
    console.log("[v0] User data:", userData)

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    console.log("[v0] Fetching Stripe connection for tenant:", userData.church_tenant_id)

    // Get Stripe connection from database
    const { data: connection, error: connectionError } = await supabase
      .from("stripe_connections")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .maybeSingle()

    console.log("[v0] Connection:", connection, "Error:", connectionError)

    if (connectionError) {
      console.log("[v0] Error fetching Stripe connection:", connectionError)
      return NextResponse.json({ error: "Failed to fetch Stripe connection" }, { status: 500 })
    }

    // Return connection status based on database record
    // The actual Stripe account verification happens during donation processing
    console.log("[v0] Stripe connection found, returning status from database")
    return NextResponse.json({
      connected: !!connection,
      active: connection?.is_active ?? true,
      details_submitted: connection?.details_submitted ?? true, // Assume true if connection exists
      payouts_enabled: connection?.payouts_enabled ?? true,
    })
  } catch (error) {
    console.error("[v0] Stripe Connect status error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to get connection status", details: errorMessage }, { status: 500 })
  }
}
