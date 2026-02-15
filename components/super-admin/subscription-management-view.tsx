"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, DollarSign, TrendingDown, Users, Search, Download, Plus } from "lucide-react"

interface Tenant {
  id: string
  name: string
  church_code: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_plan: string | null
  subscription_status: string | null
  subscription_start_date: string | null
  subscription_addons: string[] | null
  mrr: number
  created_at: string
}

interface Metrics {
  totalTenants: number
  activeSubscriptions: number
  totalMRR: string
  totalAddonRevenue: string
  churnRate: string
  planBreakdown: {
    starter: number
    starterWithSocialMedia: number
    growth: number
    enterprise: number
  }
}

export function SubscriptionManagementView() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/super-admin/subscriptions")

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
        } else {
          const errorText = await response.text()
          console.error("[v0] Non-JSON error response:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const data = await response.json()
      setTenants(data.tenants)
      setMetrics(data.metrics)
      setError(null)
    } catch (error) {
      console.error("[v0] Error fetching subscriptions:", error)
      setError(error instanceof Error ? error.message : "Failed to load subscriptions")
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.church_code?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">No Subscription</Badge>

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trialing: "secondary",
      past_due: "destructive",
      canceled: "outline",
      inactive: "secondary",
    }

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getPlanBadge = (plan: string | null, addons: string[] | null) => {
    if (!plan) return <Badge variant="outline">Free</Badge>

    const colors: Record<string, string> = {
      starter: "bg-blue-500",
      growth: "bg-purple-500",
      enterprise: "bg-amber-500",
    }

    const hasSocialMedia = addons && Array.isArray(addons) && addons.includes("social_media")

    return (
      <div className="flex items-center gap-2">
        <Badge className={colors[plan] || "bg-gray-500"}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Badge>
        {hasSocialMedia && (
          <Badge variant="outline" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Social Media
          </Badge>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-destructive text-center">
          <p className="font-semibold">Error loading subscriptions</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <Button onClick={fetchSubscriptions}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage all church subscriptions, billing, and revenue</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">All registered churches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalMRR || "0.00"}</div>
            <p className="text-xs text-muted-foreground">
              Includes ${metrics?.totalAddonRevenue || "0.00"} from add-ons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.churnRate || "0"}%</div>
            <p className="text-xs text-muted-foreground">Inactive vs total</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>Number of churches on each plan and add-ons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Starter</p>
                <p className="text-2xl font-bold">{metrics?.planBreakdown.starter || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.planBreakdown.starterWithSocialMedia || 0} with Social Media
                </p>
              </div>
              <Badge className="bg-blue-500">$39/mo</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Social Media Add-on</p>
                <p className="text-2xl font-bold">{metrics?.planBreakdown.starterWithSocialMedia || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Starter plan add-ons</p>
              </div>
              <Badge variant="outline">+$14/mo</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth</p>
                <p className="text-2xl font-bold">{metrics?.planBreakdown.growth || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Includes Social Media</p>
              </div>
              <Badge className="bg-purple-500">$89/mo</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enterprise</p>
                <p className="text-2xl font-bold">{metrics?.planBreakdown.enterprise || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Includes Social Media</p>
              </div>
              <Badge className="bg-amber-500">$199/mo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View and manage church subscriptions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by church name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church Name</TableHead>
                  <TableHead>Church Code</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.church_code || "N/A"}</TableCell>
                      <TableCell>{getPlanBadge(tenant.subscription_plan, tenant.subscription_addons)}</TableCell>
                      <TableCell>{getStatusBadge(tenant.subscription_status)}</TableCell>
                      <TableCell>${Number(tenant.mrr || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {tenant.subscription_start_date
                          ? new Date(tenant.subscription_start_date).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
