import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get tenant with Stripe subscription ID
    const { data: tenant, error: tenantError } = await supabase
      .from("church_tenants")
      .select("stripe_subscription_id, subscription_plan, additional_seats")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    if (!tenant.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id)

    return NextResponse.json({
      plan: tenant.subscription_plan || "starter",
      seats: subscription.items.data[0]?.quantity || 1,
      additionalSeats: tenant.additional_seats || 0,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}
