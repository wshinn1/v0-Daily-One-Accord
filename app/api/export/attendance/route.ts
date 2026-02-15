import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { convertToCSV, formatDateTimeForExport } from "@/lib/export-utils"
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

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    // Fetch attendance with user and event details
    let query = supabase
      .from("attendance")
      .select(
        `
        *,
        users!attendance_user_id_fkey(full_name, email),
        events(title, start_time, event_type)
      `,
      )
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("attended_at", { ascending: false })

    if (startDate) {
      query = query.gte("attended_at", startDate)
    }
    if (endDate) {
      query = query.lte("attended_at", endDate)
    }

    const { data: attendance, error } = await query

    if (error) {
      console.error("[v0] Error fetching attendance:", error)
      return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
    }

    // Format data for export
    const exportData = attendance.map((record: any) => ({
      "Attended At": formatDateTimeForExport(record.attended_at),
      "Member Name": record.users?.full_name || "",
      "Member Email": record.users?.email || "",
      "Event Title": record.events?.title || "",
      "Event Type": record.events?.event_type || "",
      "Event Start": formatDateTimeForExport(record.events?.start_time),
      Notes: record.notes || "",
    }))

    const csv = convertToCSV(exportData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
