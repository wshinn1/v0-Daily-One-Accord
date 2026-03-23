import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripeClient()
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get tenant's Stripe customer ID
    const { data: tenant, error: tenantError } = await supabase
      .from("church_tenants")
      .select("stripe_customer_id")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant?.stripe_customer_id) {
      return NextResponse.json({ error: "Tenant not found or no Stripe customer" }, { status: 404 })
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: tenant.stripe_customer_id,
      limit: 12, // Last 12 invoices
    })

    // Format invoices for frontend
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      created: invoice.created,
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
    }))

    return NextResponse.json({ invoices: formattedInvoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
