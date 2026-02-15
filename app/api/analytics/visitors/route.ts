import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all visitors for the tenant
    const { data: visitors, error: visitorsError } = await supabase
      .from("visitors")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (visitorsError) throw visitorsError

    // Status distribution
    const statusDistribution = {
      new: visitors?.filter((v) => v.status === "new").length || 0,
      follow_up: visitors?.filter((v) => v.status === "follow_up").length || 0,
      engaged: visitors?.filter((v) => v.status === "engaged").length || 0,
    }

    // Visitors added over time
    const visitorsOverTime = visitors?.reduce((acc: any, v) => {
      const date = new Date(v.created_at).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Conversion metrics (visitors who moved from new -> engaged)
    const totalVisitors = visitors?.length || 0
    const engagedVisitors = statusDistribution.engaged
    const conversionRate = totalVisitors > 0 ? ((engagedVisitors / totalVisitors) * 100).toFixed(1) : "0"

    // Average time to engagement (simplified - would need status change tracking for accuracy)
    const avgDaysToEngage =
      visitors
        ?.filter((v) => v.status === "engaged")
        .reduce((sum, v) => {
          const created = new Date(v.created_at)
          const now = new Date()
          const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / (engagedVisitors || 1)

    return NextResponse.json({
      statusDistribution,
      visitorsOverTime,
      totalVisitors,
      conversionRate: Number.parseFloat(conversionRate),
      avgDaysToEngage: Math.round(avgDaysToEngage || 0),
    })
  } catch (error) {
    console.error("[v0] Error fetching visitor analytics:", error)
    captureError(error, { endpoint: "/api/analytics/visitors", method: "GET" })
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
