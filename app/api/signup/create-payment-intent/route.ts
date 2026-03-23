import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient()
    const { email, plan } = await request.json()

    console.log("[v0] Creating setup intent for:", { email, plan })

    // Create a SetupIntent to collect payment method for future use
    // This is the correct approach for free trials with $0 upfront
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      metadata: {
        plan,
        trial_days: "7",
      },
    })

    console.log("[v0] Setup intent created:", setupIntent.id)

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    })
  } catch (error: any) {
    console.error("[v0] Error creating setup intent:", error)
    return NextResponse.json({ error: error.message || "Failed to create setup intent" }, { status: 500 })
  }
}
