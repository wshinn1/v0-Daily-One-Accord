import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { convertToCSV } from "@/lib/export-utils"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from("donations")
      .select(`
        *,
        donors (email, first_name, last_name),
        giving_funds (name),
        giving_campaigns (name)
      `)
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("donation_date", { ascending: false })

    // Filter by year if provided
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte("donation_date", startDate).lte("donation_date", endDate)
    }

    const { data: donations, error } = await query

    if (error) {
      console.error("Error fetching donations:", error)
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    // Format data for CSV
    const csvData = donations.map((d: any) => ({
      Date: new Date(d.donation_date).toLocaleDateString(),
      "Donor Name":
        d.donors?.first_name && d.donors?.last_name ? `${d.donors.first_name} ${d.donors.last_name}` : "Anonymous",
      "Donor Email": d.donors?.email || "",
      Amount: (d.amount / 100).toFixed(2),
      Fund: d.giving_funds?.name || "General Fund",
      Campaign: d.giving_campaigns?.name || "",
      "Payment Method": d.payment_method || "",
      Status: d.status,
      "Is Recurring": d.is_recurring ? "Yes" : "No",
      "Stripe Fee": (d.stripe_fee / 100).toFixed(2),
      "Net Amount": (d.net_amount / 100).toFixed(2),
    }))

    const csv = convertToCSV(csvData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="donations-${year || "all"}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting donations:", error)
    return NextResponse.json({ error: "Failed to export donations" }, { status: 500 })
  }
}
