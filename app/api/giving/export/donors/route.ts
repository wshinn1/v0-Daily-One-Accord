import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { convertToCSV } from "@/lib/export-utils"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    const { data: donors, error } = await supabase
      .from("donors")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("total_donated", { ascending: false })

    if (error) {
      console.error("Error fetching donors:", error)
      return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 })
    }

    // Format data for CSV
    const csvData = donors.map((d: any) => ({
      "First Name": d.first_name || "",
      "Last Name": d.last_name || "",
      Email: d.email,
      Phone: d.phone || "",
      "Address Line 1": d.address_line1 || "",
      "Address Line 2": d.address_line2 || "",
      City: d.city || "",
      State: d.state || "",
      "Postal Code": d.postal_code || "",
      Country: d.country || "",
      "Total Donated": (d.total_donated / 100).toFixed(2),
      "Donation Count": d.donation_count,
      "First Gift Date": d.first_gift_date ? new Date(d.first_gift_date).toLocaleDateString() : "",
      "Last Gift Date": d.last_gift_date ? new Date(d.last_gift_date).toLocaleDateString() : "",
    }))

    const csv = convertToCSV(csvData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="donors.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting donors:", error)
    return NextResponse.json({ error: "Failed to export donors" }, { status: 500 })
  }
}
