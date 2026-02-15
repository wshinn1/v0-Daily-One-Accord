import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-11-20.acacia",
    })

    const products = await stripe.products.list({ limit: 100 })
    let growthProduct = products.data.find((p) => p.name === "Growth Plan")

    if (!growthProduct) {
      // Create Growth Plan product if it doesn't exist
      growthProduct = await stripe.products.create({
        name: "Growth Plan",
        description: "Perfect for growing churches with up to 6 team members",
      })
    }

    // Create new $89 price for Growth plan
    const growthPrice = await stripe.prices.create({
      product: growthProduct.id,
      unit_amount: 8900, // $89.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Growth Plan - $89/month (with Social Media)",
    })

    // Create Social Media Add-on product and price
    const socialMediaProduct = await stripe.products.create({
      name: "Social Media Scheduling Add-On",
      description: "Schedule and publish posts to Facebook and Instagram directly from Daily One Accord",
    })

    const socialMediaPrice = await stripe.prices.create({
      product: socialMediaProduct.id,
      unit_amount: 1400, // $14.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Social Media Add-On - $14/month",
    })

    return NextResponse.json({
      success: true,
      growthPriceId: growthPrice.id,
      socialMediaPriceId: socialMediaPrice.id,
      message: "Stripe prices created successfully!",
      instructions: "Copy these price IDs and send them to v0 to update the config",
    })
  } catch (error: any) {
    console.error("Error creating Stripe prices:", error)
    return NextResponse.json(
      {
        error: error.message,
        details: error,
      },
      { status: 500 },
    )
  }
}
