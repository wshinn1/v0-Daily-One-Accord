import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { STRIPE_PRICE_IDS } from "@/lib/stripe/config"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { tenantId, seatChange } = await request.json()

    if (!tenantId || seatChange === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get tenant with Stripe subscription ID
    const { data: tenant, error: tenantError } = await supabase
      .from("church_tenants")
      .select("stripe_subscription_id, additional_seats")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    if (!tenant.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    const newAdditionalSeats = (tenant.additional_seats || 0) + seatChange

    if (newAdditionalSeats < 0) {
      return NextResponse.json({ error: "Cannot have negative additional seats" }, { status: 400 })
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id)

    // Find the additional seats item
    const seatsItem = subscription.items.data.find((item) => item.price.id === STRIPE_PRICE_IDS.additionalSeat)

    if (newAdditionalSeats === 0 && seatsItem) {
      // Remove the additional seats item if reducing to 0
      await stripe.subscriptionItems.del(seatsItem.id, {
        proration_behavior: "create_prorations",
      })
    } else if (seatsItem) {
      // Update existing seats item
      await stripe.subscriptionItems.update(seatsItem.id, {
        quantity: newAdditionalSeats,
        proration_behavior: "create_prorations",
      })
    } else if (newAdditionalSeats > 0) {
      // Add new seats item
      await stripe.subscriptionItems.create({
        subscription: tenant.stripe_subscription_id,
        price: STRIPE_PRICE_IDS.additionalSeat,
        quantity: newAdditionalSeats,
        proration_behavior: "create_prorations",
      })
    }

    // Update the tenant in the database
    await supabase.from("church_tenants").update({ additional_seats: newAdditionalSeats }).eq("id", tenantId)

    return NextResponse.json({
      success: true,
      additionalSeats: newAdditionalSeats,
    })
  } catch (error) {
    console.error("Error updating seats:", error)
    return NextResponse.json({ error: "Failed to update seats" }, { status: 500 })
  }
}
