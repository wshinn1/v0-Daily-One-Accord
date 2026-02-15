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
      .order("sent_at", { ascending: true })

    if (error) throw error

    // Calculate summary statistics
    const totalSent = analytics.length
    const totalOpened = analytics.filter((a) => a.opened_at).length
    const totalClicked = analytics.filter((a) => a.clicked_at).length
    const totalBounced = analytics.filter((a) => a.bounced_at).length

    const summary = {
      totalSent,
      totalOpened,
      totalClicked,
      totalBounced,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
    }

    // Group by email type
    const emailTypeMap = new Map<string, { sent: number; opened: number; clicked: number; bounced: number }>()

    analytics.forEach((a) => {
      const type = a.email_type || "other"
      const stats = emailTypeMap.get(type) || { sent: 0, opened: 0, clicked: 0, bounced: 0 }

      stats.sent++
      if (a.opened_at) stats.opened++
      if (a.clicked_at) stats.clicked++
      if (a.bounced_at) stats.bounced++

      emailTypeMap.set(type, stats)
    })

    const emailTypeStats = Array.from(emailTypeMap.entries()).map(([emailType, stats]) => ({
      emailType,
      ...stats,
    }))

    // Group by day
    const dailyMap = new Map<string, { sent: number; opened: number; clicked: number }>()

    analytics.forEach((a) => {
      const date = new Date(a.sent_at).toISOString().split("T")[0]
      const stats = dailyMap.get(date) || { sent: 0, opened: 0, clicked: 0 }

      stats.sent++
      if (a.opened_at) stats.opened++
      if (a.clicked_at) stats.clicked++

      dailyMap.set(date, stats)
    })

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      summary,
      emailTypeStats,
      dailyStats,
    })
  } catch (error) {
    console.error("Error fetching email analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
