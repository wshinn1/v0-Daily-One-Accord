import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { convertToCSV, formatDateForExport } from "@/lib/export-utils"
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, "export", 10, 3600)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many export requests" }, { status: 429 })
    }

    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 })
    }

    // Fetch members
    const { data: members, error } = await supabase
      .from("member_directory")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("last_name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching members:", error)
      return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
    }

    // Format data for export
    const exportData = members.map((member) => ({
      "First Name": member.first_name || "",
      "Last Name": member.last_name || "",
      Email: member.email || "",
      Phone: member.phone || "",
      "Date of Birth": formatDateForExport(member.date_of_birth),
      Gender: member.gender || "",
      "Marital Status": member.marital_status || "",
      "Membership Status": member.membership_status || "",
      "Join Date": formatDateForExport(member.join_date),
      "Street Address": member.street_address || "",
      City: member.city || "",
      State: member.state || "",
      "Zip Code": member.zip_code || "",
      Country: member.country || "",
      Notes: member.notes || "",
    }))

    const csv = convertToCSV(exportData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="members-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
