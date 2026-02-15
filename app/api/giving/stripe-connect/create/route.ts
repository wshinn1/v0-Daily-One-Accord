import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact your administrator to set up Stripe integration." },
        { status: 503 },
      )
    }

    const { createConnectAccount, createAccountLink } = await import("@/lib/stripe/stripe-connect")

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's church tenant
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("church_tenant_id, role")
      .eq("id", user.id)
      .single()

    if (userDataError || !userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    // Check if user is admin or lead_admin
    if (!["admin", "lead_admin", "admin_staff"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions. Only admins can connect Stripe." }, { status: 403 })
    }

    // Get church details
    const { data: church, error: churchError } = await supabase
      .from("church_tenants")
      .select("name")
      .eq("id", userData.church_tenant_id)
      .single()

    if (churchError || !church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from("stripe_connections")
      .select("stripe_account_id")
      .eq("church_tenant_id", userData.church_tenant_id)
      .maybeSingle()

    let stripeAccountId = existingConnection?.stripe_account_id

    // Create Stripe Connect account if it doesn't exist
    if (!stripeAccountId) {
      const account = await createConnectAccount(user.email!, church.name)
      stripeAccountId = account.id

      // Save to database
      const { error: insertError } = await supabase.from("stripe_connections").insert({
        church_tenant_id: userData.church_tenant_id,
        stripe_account_id: stripeAccountId,
        is_active: false,
      })

      if (insertError) {
        console.error("[v0] Failed to save Stripe connection:", insertError)
        return NextResponse.json({ error: "Failed to save connection" }, { status: 500 })
      }
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const returnUrl = `${baseUrl}/dashboard/giving/settings?success=true`
    const refreshUrl = `${baseUrl}/dashboard/giving/settings?refresh=true`

    const accountLink = await createAccountLink(stripeAccountId, returnUrl, refreshUrl)

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("[v0] Stripe Connect creation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create Stripe connection"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
