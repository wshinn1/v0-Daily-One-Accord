import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and tenant
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    // Fetch donations with related data
    const { data: donations, error } = await supabase
      .from("donations")
      .select(`
        *,
        donors (email, first_name, last_name),
        giving_funds (name),
        giving_campaigns (name)
      `)
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching donations:", error)
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    // Format the response
    const formattedDonations = donations?.map((donation: any) => ({
      id: donation.id,
      amount: donation.amount,
      status: donation.status,
      payment_method: donation.payment_method,
      donor_email: donation.donors?.email || "Unknown",
      donor_name:
        donation.donors?.first_name && donation.donors?.last_name
          ? `${donation.donors.first_name} ${donation.donors.last_name}`
          : null,
      fund_name: donation.giving_funds?.name || null,
      campaign_name: donation.giving_campaigns?.name || null,
      is_recurring: donation.is_recurring || false,
      created_at: donation.created_at,
    }))

    return NextResponse.json({ donations: formattedDonations })
  } catch (error) {
    console.error("Error in donations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
