import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

async function createSocialMediaPricing() {
  try {
    console.log("🚀 Creating Stripe prices for social media feature...\n")

    // Get existing Growth plan product
    const products = await stripe.products.list({ limit: 100 })
    const growthProduct = products.data.find((p) => p.name.toLowerCase().includes("growth"))

    if (!growthProduct) {
      throw new Error("Growth plan product not found in Stripe")
    }

    console.log(`✓ Found Growth plan product: ${growthProduct.id}`)

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

    console.log(`✓ Created Growth plan $89 price: ${growthPrice.id}\n`)

    // Create Social Media Add-On product
    const addOnProduct = await stripe.products.create({
      name: "Social Media Scheduling Add-On",
      description: "Schedule and publish posts to Facebook and Instagram directly from Daily One Accord",
      active: true,
    })

    console.log(`✓ Created Social Media add-on product: ${addOnProduct.id}`)

    // Create $14 price for add-on
    const addOnPrice = await stripe.prices.create({
      product: addOnProduct.id,
      unit_amount: 1400, // $14.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Social Media Add-On - $14/month",
    })

    console.log(`✓ Created Social Media add-on $14 price: ${addOnPrice.id}\n`)

    // Output results
    console.log("✅ SUCCESS! Copy these price IDs:\n")
    console.log("Growth Plan $89 Price ID:")
    console.log(`  ${growthPrice.id}\n`)
    console.log("Social Media Add-On $14 Price ID:")
    console.log(`  ${addOnPrice.id}\n`)
    console.log("Next steps:")
    console.log("1. Update lib/stripe/config.ts with these price IDs")
    console.log("2. Deploy your changes")
    console.log("3. Test the new pricing in your app")
  } catch (error) {
    console.error("❌ Error creating Stripe prices:", error)
    process.exit(1)
  }
}

createSocialMediaPricing()
