import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get all recurring donations
    const { data: recurringDonations } = await supabase
      .from("recurring_donations")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (!recurringDonations) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = recurringDonations
      .filter((d) => d.status === "active")
      .reduce((sum, d) => {
        // Convert to monthly amount
        const monthlyAmount =
          d.interval === "month"
            ? d.amount / d.interval_count
            : d.interval === "year"
              ? d.amount / (12 * d.interval_count)
              : d.interval === "week"
                ? (d.amount * 4.33) / d.interval_count
                : d.amount * 30
        return sum + monthlyAmount
      }, 0)

    // Calculate churn rate (canceled in last 30 days / total active 30 days ago)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const canceledLast30Days = recurringDonations.filter(
      (d) => d.canceled_at && new Date(d.canceled_at) >= thirtyDaysAgo,
    ).length

    const activeDonations = recurringDonations.filter((d) => d.status === "active").length
    const churnRate = activeDonations > 0 ? (canceledLast30Days / (activeDonations + canceledLast30Days)) * 100 : 0

    // Calculate average lifetime value
    const avgLifetimeValue =
      recurringDonations.length > 0
        ? recurringDonations.reduce((sum, d) => sum + d.total_amount, 0) / recurringDonations.length
        : 0

    // Calculate retention rate
    const totalDonors = recurringDonations.length
    const retainedDonors = recurringDonations.filter((d) => d.status === "active").length
    const retentionRate = totalDonors > 0 ? (retainedDonors / totalDonors) * 100 : 0

    // Get status breakdown
    const statusBreakdown = recurringDonations.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      mrr: mrr / 100, // Convert from cents to dollars
      churnRate,
      avgLifetimeValue: avgLifetimeValue / 100,
      retentionRate,
      totalSubscriptions: recurringDonations.length,
      activeSubscriptions: activeDonations,
      statusBreakdown,
    })
  } catch (error) {
    console.error("[v0] Error fetching recurring analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
