import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get("range") || "7d"

    // Get current user and church
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    const daysAgo = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Fetch analytics data
    const { data: analytics, error } = await supabase
      .from("email_analytics")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .gte("sent_at", startDate.toISOString())
      .order("sent_at", { ascending: false })

    if (error) throw error

    // Generate CSV
    const headers = [
      "Email ID",
      "Type",
      "Recipient",
      "Subject",
      "Sent At",
      "Opened At",
      "Clicked At",
      "Bounced At",
      "Bounce Type",
      "Open Count",
      "Click Count",
    ]

    const rows = analytics.map((a) => [
      a.email_id,
      a.email_type,
      a.recipient_email,
      a.subject || "",
      a.sent_at,
      a.opened_at || "",
      a.clicked_at || "",
      a.bounced_at || "",
      a.bounce_type || "",
      a.open_count,
      a.click_count,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="email-analytics-${range}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}
