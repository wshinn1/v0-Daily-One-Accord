"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Users, Download, RefreshCw, Target } from "lucide-react"
import { formatDate } from "@/lib/date-utils"

export function GivingAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y" | "all">("30d")

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const response = await fetch(`/api/giving/analytics?range=${timeRange}`)
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

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Giving Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your church's giving</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
          <TabsTrigger value="1y">Last Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Total Giving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.metrics.totalGiving)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.givingGrowth >= 0 ? "+" : ""}
              {analytics.metrics.givingGrowth.toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Active Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.activeDonors}</div>
            <p className="text-xs text-muted-foreground">{analytics.metrics.newDonors} new this period</p>
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
            <div className="text-2xl font-bold">{formatCurrency(analytics.metrics.averageGift)}</div>
            <p className="text-xs text-muted-foreground">Per donation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Donors who gave again</p>
          </CardContent>
        </Card>
      </div>

      {/* Giving Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Giving Trends</CardTitle>
          <CardDescription>Daily giving amounts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Date</div>
              <div className="col-span-6 text-right">Amount</div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {analytics.timeline.slice(0, 10).map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-7 gap-2 text-sm">
                  <div className="text-muted-foreground">{formatDate(new Date(item.date), "MMM d")}</div>
                  <div className="col-span-6 text-right font-medium">{formatCurrency(item.amount / 100)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Giving by Fund */}
        <Card>
          <CardHeader>
            <CardTitle>Giving by Fund</CardTitle>
            <CardDescription>Distribution across designated funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.fundDistribution.map((fund: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{fund.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(fund.value / 100)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${(fund.value / analytics.metrics.totalGiving) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Donor Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Segmentation</CardTitle>
            <CardDescription>Donors by giving tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.donorSegmentation.map((segment: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{segment.tier}</span>
                    <span className="text-muted-foreground">{segment.count} donors</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(segment.count / analytics.metrics.activeDonors) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donor Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donor Insights</CardTitle>
          <CardDescription>Key metrics about donor behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Lapsed Donors</p>
              <p className="text-2xl font-bold">{analytics.donorInsights.lapsedDonors}</p>
              <p className="text-xs text-muted-foreground">Haven't given in 12+ months</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Major Donors</p>
              <p className="text-2xl font-bold">{analytics.donorInsights.majorDonors}</p>
              <p className="text-xs text-muted-foreground">Top 10% of givers</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg. Lifetime Value</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.donorInsights.avgLifetimeValue)}</p>
              <p className="text-xs text-muted-foreground">Per donor</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Giving Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Giving</CardTitle>
          <CardDescription>Subscription-based giving performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(analytics.recurringMetrics.mrr)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{analytics.recurringMetrics.activeSubscriptions}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
              <p className="text-2xl font-bold">{analytics.recurringMetrics.churnRate.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
              <p className="text-2xl font-bold">{analytics.recurringMetrics.retentionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
