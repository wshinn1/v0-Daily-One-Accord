import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { STRIPE_PRICE_IDS } from "@/lib/stripe/config"
import { asyncHandler, ValidationError, ExternalAPIError } from "@/lib/errors/handler"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const { planType, setupFeeTier = "standard", email, churchName } = await request.json()

  console.log("[v0] Creating checkout session:", { planType, setupFeeTier, email })

  if (!["starter", "growth", "enterprise"].includes(planType)) {
    throw new ValidationError("Invalid plan type. Must be starter, growth, or enterprise")
  }

  if (!["standard", "promotional", "launch"].includes(setupFeeTier)) {
    throw new ValidationError("Invalid setup fee tier. Must be standard, promotional, or launch")
  }

  if (!email || !churchName) {
    throw new ValidationError("Email and church name are required")
  }

  // Get the price IDs
  const subscriptionPriceId = STRIPE_PRICE_IDS[planType as keyof typeof STRIPE_PRICE_IDS]
  const setupFeePriceId = STRIPE_PRICE_IDS.setupFees[setupFeeTier as keyof typeof STRIPE_PRICE_IDS.setupFees]

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
        },
        {
          price: setupFeePriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        planType,
        setupFeeTier,
        churchName: churchName || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    })

    console.log("[v0] Checkout session created:", session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    throw new ExternalAPIError("Stripe", "Failed to create checkout session", { originalError: error })
  }
})
