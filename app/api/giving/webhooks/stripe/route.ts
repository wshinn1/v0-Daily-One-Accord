import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"
import { sendDonationReceipt } from "@/lib/giving/email-receipts"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("[v0] Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Create donation record
        const metadata = session.metadata!
        const { data: donation, error } = await supabase
          .from("donations")
          .insert({
            church_tenant_id: metadata.church_tenant_id,
            donor_id: metadata.donor_id,
            fund_id: metadata.fund_id || null,
            amount: session.amount_total!,
            currency: session.currency!,
            status: "succeeded",
            stripe_payment_intent_id: session.payment_intent as string,
            is_recurring: session.mode === "subscription",
            recurring_subscription_id: session.mode === "subscription" ? (session.subscription as string) : null,
            is_anonymous: metadata.is_anonymous === "true",
            donor_note: metadata.donor_note || null,
            donation_date: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Error creating donation record:", error)
          break
        }

        console.log("[v0] Donation created:", donation?.id)

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
            stripeAccount: session.metadata?.stripe_account_id,
          })

          await supabase.from("recurring_donations").insert({
            church_tenant_id: metadata.church_tenant_id,
            donor_id: metadata.donor_id,
            fund_id: metadata.fund_id || null,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            amount: subscription.items.data[0].price.unit_amount!,
            currency: subscription.currency,
            interval: subscription.items.data[0].price.recurring!.interval,
            interval_count: subscription.items.data[0].price.recurring!.interval_count,
            status: subscription.status,
            start_date: new Date(subscription.start_date * 1000).toISOString(),
            next_payment_date: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
          })

          console.log("[v0] Recurring donation created for subscription:", subscription.id)
        }

        try {
          // Fetch donor details
          const { data: donor } = await supabase.from("donors").select("*").eq("id", metadata.donor_id).single()

          // Fetch church details
          const { data: church } = await supabase
            .from("church_tenants")
            .select("name")
            .eq("id", metadata.church_tenant_id)
            .single()

          // Fetch fund details if applicable
          let fundName = null
          if (metadata.fund_id) {
            const { data: fund } = await supabase
              .from("giving_funds")
              .select("name")
              .eq("id", metadata.fund_id)
              .single()
            fundName = fund?.name || null
          }

          if (donor && church) {
            await sendDonationReceipt({
              donorEmail: donor.email,
              donorName: donor.first_name && donor.last_name ? `${donor.first_name} ${donor.last_name}` : null,
              amount: donation.amount,
              fundName,
              campaignName: null,
              donationDate: donation.donation_date,
              transactionId: donation.id,
              churchName: church.name,
              isRecurring: donation.is_recurring,
            })
            console.log("[v0] Email receipt sent to:", donor.email)
          }
        } catch (emailError) {
          console.error("[v0] Failed to send email receipt:", emailError)
          // Don't fail the webhook if email fails
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("recurring_donations")
          .update({
            status: subscription.status,
            next_payment_date: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq("stripe_subscription_id", subscription.id)

        console.log("[v0] Recurring donation updated:", subscription.id, "Status:", subscription.status)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("recurring_donations")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        console.log("[v0] Recurring donation canceled:", subscription.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          // This is a recurring payment, not the initial subscription
          const { data: recurringDonation } = await supabase
            .from("recurring_donations")
            .select("*")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single()

          if (recurringDonation) {
            // Create a new donation record for this recurring payment
            const { data: donation } = await supabase
              .from("donations")
              .insert({
                church_tenant_id: recurringDonation.church_tenant_id,
                donor_id: recurringDonation.donor_id,
                fund_id: recurringDonation.fund_id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: "succeeded",
                stripe_payment_intent_id: invoice.payment_intent as string,
                stripe_charge_id: invoice.charge as string,
                is_recurring: true,
                recurring_subscription_id: invoice.subscription as string,
                donation_date: new Date(invoice.created * 1000).toISOString(),
              })
              .select()
              .single()

            // Update recurring donation stats
            await supabase
              .from("recurring_donations")
              .update({
                total_donations: (recurringDonation.total_donations || 0) + 1,
                total_amount: (recurringDonation.total_amount || 0) + invoice.amount_paid,
                last_donation_date: new Date(invoice.created * 1000).toISOString(),
              })
              .eq("id", recurringDonation.id)

            console.log("[v0] Recurring payment processed:", donation?.id)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const { data: recurringDonation } = await supabase
            .from("recurring_donations")
            .select("*, donors(*), church_tenants(name)")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single()

          if (recurringDonation) {
            // Update status to past_due
            await supabase
              .from("recurring_donations")
              .update({
                status: "past_due",
              })
              .eq("id", recurringDonation.id)

            // TODO: Send failed payment notification email to donor
            console.log("[v0] Recurring payment failed for subscription:", invoice.subscription)
          }
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update donation with charge details
        await supabase
          .from("donations")
          .update({
            stripe_charge_id: paymentIntent.latest_charge as string,
            payment_method: paymentIntent.payment_method_types[0],
            status: "succeeded",
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await supabase
          .from("donations")
          .update({
            status: "failed",
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge

        await supabase
          .from("donations")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
          })
          .eq("stripe_charge_id", charge.id)

        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
