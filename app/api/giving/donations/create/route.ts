import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // requests
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and church
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    const body = await request.json()
    const { amount, fundId, isRecurring, recurringInterval, isAnonymous, donorNote, donor } = body

    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json({ error: "Minimum donation amount is $1.00" }, { status: 400 })
    }

    if (amount > 100000000) {
      // $1M max
      return NextResponse.json({ error: "Maximum donation amount is $1,000,000" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!donor?.email || !emailRegex.test(donor.email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    if (!donor.firstName || !donor.lastName) {
      return NextResponse.json({ error: "First and last name are required" }, { status: 400 })
    }

    const sanitizedNote = donorNote?.substring(0, 500) || ""

    // Get Stripe connection for this church
    const { data: stripeConnection } = await supabase
      .from("stripe_connections")
      .select("stripe_account_id, is_charges_enabled")
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("is_active", true)
      .single()

    if (!stripeConnection || !stripeConnection.is_charges_enabled) {
      return NextResponse.json({ error: "Stripe is not connected or not enabled for this church" }, { status: 400 })
    }

    // Create or get donor
    let donorRecord
    const { data: existingDonor } = await supabase
      .from("donors")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("email", donor.email)
      .single()

    if (existingDonor) {
      donorRecord = existingDonor
    } else {
      const { data: newDonor, error: donorError } = await supabase
        .from("donors")
        .insert({
          church_tenant_id: userData.church_tenant_id,
          email: donor.email,
          first_name: donor.firstName,
          last_name: donor.lastName,
          phone: donor.phone,
          is_anonymous: isAnonymous,
        })
        .select()
        .single()

      if (donorError) {
        console.error("[v0] Error creating donor:", donorError)
        return NextResponse.json({ error: "Failed to create donor" }, { status: 500 })
      }

      donorRecord = newDonor
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(
      {
        mode: isRecurring ? "subscription" : "payment",
        customer_email: donor.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Donation${fundId ? " to Fund" : ""}`,
                description: sanitizedNote || undefined,
              },
              unit_amount: amount,
              ...(isRecurring && {
                recurring: {
                  interval: recurringInterval,
                },
              }),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/give/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/give/cancel`,
        metadata: {
          church_tenant_id: userData.church_tenant_id,
          donor_id: donorRecord.id,
          fund_id: fundId || "",
          is_anonymous: isAnonymous.toString(),
          donor_note: sanitizedNote,
        },
      },
      {
        stripeAccount: stripeConnection.stripe_account_id,
      },
    )

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("[v0] Error creating donation:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}
