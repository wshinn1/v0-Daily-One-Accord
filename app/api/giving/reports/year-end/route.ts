import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || new Date().getFullYear().toString()

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

    // Fetch all donations for the year
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: donations } = await supabase
      .from("donations")
      .select(`
        *,
        donors (*)
      `)
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("status", "succeeded")
      .gte("donation_date", startDate)
      .lte("donation_date", endDate)

    if (!donations) {
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    // Group donations by donor
    const donorMap = new Map()
    donations.forEach((d: any) => {
      const donorId = d.donor_id
      if (!donorMap.has(donorId)) {
        donorMap.set(donorId, {
          donor: d.donors,
          donations: [],
          total: 0,
        })
      }
      const donorData = donorMap.get(donorId)
      donorData.donations.push(d)
      donorData.total += d.amount
    })

    // TODO: Generate PDF statements for each donor
    // This would use a PDF generation library like PDFKit or html2pdf
    // For now, we'll just return the data structure

    const statements = Array.from(donorMap.values()).map((data) => ({
      donor: data.donor,
      year,
      total: data.total / 100,
      donationCount: data.donations.length,
      donations: data.donations.map((d: any) => ({
        date: d.donation_date,
        amount: d.amount / 100,
        fund: d.fund_id,
      })),
    }))

    return NextResponse.json({
      success: true,
      statementCount: statements.length,
      message: `Generated ${statements.length} year-end statements for ${year}`,
    })
  } catch (error) {
    console.error("Error generating year-end statements:", error)
    return NextResponse.json({ error: "Failed to generate statements" }, { status: 500 })
  }
}
