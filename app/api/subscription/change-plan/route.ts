import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { STRIPE_PRICE_IDS, type PlanType } from "@/lib/stripe/config"

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient()
    const { tenantId, newPlan } = await request.json()

    if (!tenantId || !newPlan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get tenant with Stripe subscription ID
    const { data: tenant, error: tenantError } = await supabase
      .from("church_tenants")
      .select("stripe_subscription_id, subscription_plan")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    if (!tenant.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id)

    // Find the plan subscription item
    const planItem = subscription.items.data.find((item) =>
      Object.values(STRIPE_PRICE_IDS).includes(item.price.id as any),
    )

    if (!planItem) {
      return NextResponse.json({ error: "Plan item not found in subscription" }, { status: 404 })
    }

    // Update the subscription with the new plan
    const updatedSubscription = await stripe.subscriptions.update(tenant.stripe_subscription_id, {
      items: [
        {
          id: planItem.id,
          price: STRIPE_PRICE_IDS[newPlan as PlanType],
        },
      ],
      proration_behavior: "create_prorations", // Prorate the charges
    })

    // Update the tenant in the database
    await supabase.from("church_tenants").update({ subscription_plan: newPlan }).eq("id", tenantId)

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error("Error changing plan:", error)
    return NextResponse.json({ error: "Failed to change plan" }, { status: 500 })
  }
}
