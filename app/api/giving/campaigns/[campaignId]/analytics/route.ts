import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userRole } = await supabase
      .from("user_church_roles")
      .select("church_tenant_id")
      .eq("user_id", user.id)
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    const campaignId = params.campaignId

    // Get campaign details
    const { data: campaign } = await supabase
      .from("giving_campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("church_tenant_id", userRole.church_tenant_id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Get all donations for this campaign
    const { data: donations } = await supabase
      .from("donations")
      .select("*, donors(email, first_name, last_name)")
      .eq("campaign_id", campaignId)
      .eq("church_tenant_id", userRole.church_tenant_id)
      .eq("status", "succeeded")
      .order("donation_date", { ascending: false })

    if (!donations) {
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    // Calculate metrics
    const totalDonations = donations.length
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
    const averageGift = totalDonations > 0 ? totalAmount / totalDonations : 0

    // Unique donors
    const uniqueDonorIds = new Set(donations.map((d) => d.donor_id))
    const uniqueDonors = uniqueDonorIds.size

    // New vs repeat donors
    const { data: allDonations } = await supabase
      .from("donations")
      .select("donor_id, donation_date")
      .eq("church_tenant_id", userRole.church_tenant_id)
      .eq("status", "succeeded")
      .order("donation_date", { ascending: true })

    const firstDonationMap = new Map()
    allDonations?.forEach((d) => {
      if (!firstDonationMap.has(d.donor_id)) {
        firstDonationMap.set(d.donor_id, d.donation_date)
      }
    })

    let newDonors = 0
    let repeatDonors = 0

    donations.forEach((d) => {
      const firstDonation = firstDonationMap.get(d.donor_id)
      if (firstDonation === d.donation_date) {
        newDonors++
      } else {
        repeatDonors++
      }
    })

    // Donation timeline (group by day)
    const timelineMap = new Map()
    donations.forEach((d) => {
      const date = new Date(d.donation_date).toISOString().split("T")[0]
      const existing = timelineMap.get(date) || { date, amount: 0, count: 0 }
      existing.amount += d.amount
      existing.count += 1
      timelineMap.set(date, existing)
    })

    const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    // Progress percentage
    const progressPercentage = (campaign.current_amount / campaign.goal_amount) * 100

    // Days remaining
    const now = new Date()
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null

    // Projected completion (if we have data)
    let projectedCompletionDays = null
    if (timeline.length > 1 && campaign.current_amount < campaign.goal_amount) {
      const daysSinceStart = Math.max(
        1,
        (now.getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24),
      )
      const dailyAverage = campaign.current_amount / daysSinceStart
      const remainingAmount = campaign.goal_amount - campaign.current_amount
      projectedCompletionDays = Math.ceil(remainingAmount / dailyAverage)
    }

    // Recent donations (last 10)
    const recentDonations = donations.slice(0, 10).map((d) => ({
      id: d.id,
      amount: d.amount,
      donor_name: d.is_anonymous
        ? "Anonymous"
        : `${d.donors?.first_name || ""} ${d.donors?.last_name || ""}`.trim() || "Anonymous",
      donation_date: d.donation_date,
    }))

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        goal_amount: campaign.goal_amount,
        current_amount: campaign.current_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
      },
      metrics: {
        totalDonations,
        totalAmount: totalAmount / 100,
        averageGift: averageGift / 100,
        uniqueDonors,
        newDonors,
        repeatDonors,
        progressPercentage: Math.min(progressPercentage, 100),
        daysRemaining,
        projectedCompletionDays,
      },
      timeline,
      recentDonations,
    })
  } catch (error) {
    console.error("[v0] Error fetching campaign analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
