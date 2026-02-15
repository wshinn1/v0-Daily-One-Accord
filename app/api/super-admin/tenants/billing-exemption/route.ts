import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Verify super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { tenantId, billingExempt, reason } = await request.json()

    // Get current tenant data
    const { data: tenant } = await supabase
      .from("church_tenants")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", tenantId)
      .single()

    // If setting billing exempt and there's an active subscription, cancel it
    if (billingExempt && tenant?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(tenant.stripe_subscription_id)
      } catch (error) {
        console.error("Error canceling Stripe subscription:", error)
      }
    }

    // Update tenant
    const { data: updatedTenant, error } = await supabase
      .from("church_tenants")
      .update({
        billing_exempt: billingExempt,
        billing_exempt_reason: billingExempt ? reason : null,
        billing_exempt_set_by: user.id,
        billing_exempt_set_at: new Date().toISOString(),
        mrr: billingExempt ? 0 : undefined,
        subscription_status: billingExempt ? "exempt" : undefined,
      })
      .eq("id", tenantId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedTenant)
  } catch (error) {
    console.error("Error updating billing exemption:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
