import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

function subtractYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() - years)
  return result
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

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

    const now = new Date()
    let startDate: Date
    switch (range) {
      case "30d":
        startDate = subtractDays(now, 30)
        break
      case "90d":
        startDate = subtractDays(now, 90)
        break
      case "1y":
        startDate = subtractYears(now, 1)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Fetch all donations in range
    const { data: donations } = await supabase
      .from("donations")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("status", "succeeded")
      .gte("donation_date", startDate.toISOString())

    // Fetch all donors
    const { data: donors } = await supabase.from("donors").select("*").eq("church_tenant_id", userData.church_tenant_id)

    // Fetch recurring donations
    const { data: recurringDonations } = await supabase
      .from("recurring_donations")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)

    // Fetch funds
    const { data: funds } = await supabase
      .from("giving_funds")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (!donations || !donors || !recurringDonations || !funds) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Calculate metrics
    const totalGiving = donations.reduce((sum, d) => sum + d.amount, 0) / 100
    const activeDonors = new Set(donations.map((d) => d.donor_id)).size
    const averageGift = donations.length > 0 ? totalGiving / donations.length : 0

    // Calculate previous period for growth
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousStartDate = subtractDays(startDate, periodDays)
    const { data: previousDonations } = await supabase
      .from("donations")
      .select("amount")
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("status", "succeeded")
      .gte("donation_date", previousStartDate.toISOString())
      .lt("donation_date", startDate.toISOString())

    const previousTotal = (previousDonations?.reduce((sum, d) => sum + d.amount, 0) || 0) / 100
    const givingGrowth = previousTotal > 0 ? ((totalGiving - previousTotal) / previousTotal) * 100 : 0

    // New donors in this period
    const newDonors = donors.filter((d) => d.first_gift_date && new Date(d.first_gift_date) >= startDate).length

    // Retention rate (donors who gave in both periods)
    const previousDonorIds = new Set(previousDonations?.map((d: any) => d.donor_id) || [])
    const currentDonorIds = new Set(donations.map((d) => d.donor_id))
    const retainedDonors = Array.from(previousDonorIds).filter((id) => currentDonorIds.has(id)).length
    const retentionRate = previousDonorIds.size > 0 ? (retainedDonors / previousDonorIds.size) * 100 : 0

    // Timeline (group by day)
    const timelineMap = new Map()
    donations.forEach((d) => {
      const date = new Date(d.donation_date).toISOString().split("T")[0]
      const existing = timelineMap.get(date) || { date, amount: 0, count: 0 }
      existing.amount += d.amount
      existing.count += 1
      timelineMap.set(date, existing)
    })
    const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    // Fund distribution
    const fundMap = new Map()
    donations.forEach((d) => {
      const fundId = d.fund_id || "general"
      const existing = fundMap.get(fundId) || 0
      fundMap.set(fundId, existing + d.amount)
    })
    const fundDistribution = Array.from(fundMap.entries()).map(([fundId, value]) => {
      const fund = funds.find((f) => f.id === fundId)
      return {
        name: fund?.name || "General Fund",
        value,
      }
    })

    // Donor segmentation by giving tier
    const donorSegmentation = [
      { tier: "$0-$100", count: donors.filter((d) => d.total_donated < 10000).length },
      { tier: "$100-$500", count: donors.filter((d) => d.total_donated >= 10000 && d.total_donated < 50000).length },
      { tier: "$500-$1000", count: donors.filter((d) => d.total_donated >= 50000 && d.total_donated < 100000).length },
      { tier: "$1000+", count: donors.filter((d) => d.total_donated >= 100000).length },
    ]

    // Donor insights
    const twelveMonthsAgo = subtractMonths(now, 12)
    const lapsedDonors = donors.filter((d) => d.last_gift_date && new Date(d.last_gift_date) < twelveMonthsAgo).length

    const sortedDonors = [...donors].sort((a, b) => b.total_donated - a.total_donated)
    const top10Percent = Math.ceil(sortedDonors.length * 0.1)
    const majorDonors = top10Percent

    const avgLifetimeValue =
      donors.length > 0 ? donors.reduce((sum, d) => sum + d.total_donated, 0) / donors.length / 100 : 0

    // Recurring metrics
    const activeSubscriptions = recurringDonations.filter((d) => d.status === "active").length
    const mrr =
      recurringDonations
        .filter((d) => d.status === "active")
        .reduce((sum, d) => {
          const monthlyAmount =
            d.interval === "month"
              ? d.amount / d.interval_count
              : d.interval === "year"
                ? d.amount / (12 * d.interval_count)
                : d.interval === "week"
                  ? (d.amount * 4.33) / d.interval_count
                  : d.amount * 30
          return sum + monthlyAmount
        }, 0) / 100

    const thirtyDaysAgo = subtractDays(now, 30)
    const canceledLast30Days = recurringDonations.filter(
      (d) => d.canceled_at && new Date(d.canceled_at) >= thirtyDaysAgo,
    ).length
    const churnRate =
      activeSubscriptions > 0 ? (canceledLast30Days / (activeSubscriptions + canceledLast30Days)) * 100 : 0

    const recurringRetentionRate =
      recurringDonations.length > 0 ? (activeSubscriptions / recurringDonations.length) * 100 : 0

    return NextResponse.json({
      metrics: {
        totalGiving,
        givingGrowth,
        activeDonors,
        newDonors,
        averageGift,
        retentionRate,
      },
      timeline,
      fundDistribution,
      donorSegmentation,
      donorInsights: {
        lapsedDonors,
        majorDonors,
        avgLifetimeValue,
      },
      recurringMetrics: {
        mrr,
        activeSubscriptions,
        churnRate,
        retentionRate: recurringRetentionRate,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching giving analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
