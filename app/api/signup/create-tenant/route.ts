import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { STRIPE_PRICE_IDS, PLAN_DETAILS } from "@/lib/stripe/config"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, rateLimiters.signup)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }

  try {
    const {
      firstName,
      lastName,
      email,
      church,
      address,
      position,
      plan,
      additionalSeats = 0,
      includeSocialMedia = false, // Added social media add-on parameter
      paymentMethodId,
    } = await request.json()

    console.log("[v0] Creating tenant for:", { email, church, plan, additionalSeats, includeSocialMedia })

    const planDetails = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS]
    const totalSeats = planDetails.includedSeats + additionalSeats

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      metadata: {
        church_name: church,
        position,
        total_seats: totalSeats.toString(),
        additional_seats: additionalSeats.toString(),
        has_social_media_addon: includeSocialMedia.toString(), // Track social media add-on in Stripe metadata
      },
    })

    console.log("[v0] Stripe customer created:", customer.id)

    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [
      { price: STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS] },
    ]

    if (additionalSeats > 0) {
      subscriptionItems.push({
        price: STRIPE_PRICE_IDS.additionalSeat,
        quantity: additionalSeats,
      })
    }

    if (plan === "starter" && includeSocialMedia) {
      subscriptionItems.push({
        price: STRIPE_PRICE_IDS.socialMediaAddon,
        quantity: 1,
      })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: subscriptionItems,
      trial_period_days: 7,
      metadata: {
        church_name: church,
        total_seats: totalSeats.toString(),
        has_social_media_addon: includeSocialMedia.toString(), // Track in subscription metadata
      },
    })

    console.log("[v0] Subscription created:", subscription.id)

    const { data: tenant, error: tenantError } = await supabase
      .from("church_tenants")
      .insert({
        name: church,
        address,
        subscription_plan: plan,
        subscription_status: "trialing",
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_seats: totalSeats,
        additional_seats: additionalSeats,
        has_social_media_addon: includeSocialMedia, // Store social media add-on status in database
      })
      .select()
      .single()

    if (tenantError) {
      console.error("[v0] Error creating tenant:", tenantError)
      throw new Error("Failed to create church tenant")
    }

    console.log("[v0] Tenant created:", tenant.id)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        position,
        tenant_id: tenant.id,
      },
    })

    if (authError) {
      console.error("[v0] Error creating user:", authError)
      throw new Error("Failed to create user account")
    }

    console.log("[v0] User created:", authData.user.id)

    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "admin",
      tenant_id: tenant.id,
      position,
    })

    if (userError) {
      console.error("[v0] Error adding user to users table:", userError)
    }

    console.log("[v0] Tenant setup completed successfully")

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error("[v0] Error in create-tenant:", error)
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 })
  }
}
