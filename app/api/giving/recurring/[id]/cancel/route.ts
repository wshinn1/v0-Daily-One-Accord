import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stripe = getStripeClient()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    const body = await request.json()
    const { cancelReason } = body

    // Get recurring donation
    const { data: recurringDonation, error: fetchError } = await supabase
      .from("recurring_donations")
      .select("*, stripe_connections!inner(stripe_account_id)")
      .eq("id", params.id)
      .eq("church_tenant_id", userData.church_tenant_id)
      .single()

    if (fetchError || !recurringDonation) {
      return NextResponse.json({ error: "Recurring donation not found" }, { status: 404 })
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(recurringDonation.stripe_subscription_id, {
      stripeAccount: recurringDonation.stripe_connections.stripe_account_id,
    })

    // Update in database
    await supabase
      .from("recurring_donations")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        cancel_reason: cancelReason || null,
      })
      .eq("id", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error canceling recurring donation:", error)
    return NextResponse.json({ error: "Failed to cancel recurring donation" }, { status: 500 })
  }
}
