"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Users, TrendingUp, Calendar, Target, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/date-utils"

interface CampaignAnalyticsDashboardProps {
  campaignId: string
}

export function CampaignAnalyticsDashboard({ campaignId }: CampaignAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [campaignId])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/giving/campaigns/${campaignId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>
  }

  const { campaign, metrics, timeline, recentDonations } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <p className="text-muted-foreground">Campaign Analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{metrics.progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{formatCurrency(campaign.current_amount / 100)}</span>
              <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount / 100)}</span>
            </div>
          </div>

          {metrics.daysRemaining !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{metrics.daysRemaining === 0 ? "Ends today" : `${metrics.daysRemaining} days remaining`}</span>
            </div>
          )}

          {metrics.projectedCompletionDays && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Projected to reach goal in {metrics.projectedCompletionDays} days at current pace</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{metrics.totalDonations} donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Average Gift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageGift)}</div>
            <p className="text-xs text-muted-foreground">per donation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Unique Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uniqueDonors}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.newDonors} new, {metrics.repeatDonors} repeat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.uniqueDonors > 0 ? ((metrics.repeatDonors / metrics.uniqueDonors) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">repeat donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Timeline</CardTitle>
          <CardDescription>Daily donation amounts over time</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Date</div>
                <div className="col-span-6 text-right">Amount</div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {timeline.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-7 gap-2 text-sm">
                    <div className="text-muted-foreground">{formatDate(new Date(item.date), "MMM d")}</div>
                    <div className="col-span-6 text-right font-medium">{formatCurrency(item.amount / 100)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">No donation data yet</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest contributions to this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.map((donation: any) => (
                <div key={donation.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{donation.donor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(donation.donation_date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {formatCurrency(donation.amount / 100)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No donations yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
