"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, TrendingDown } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils/date-helpers"

interface TenantStatus {
  id: string
  name: string
  created_at: string
  setupStatus: {
    hasLeadAdmin: boolean
    hasAccessCode: boolean
    hasSlack: boolean
  }
  completedSteps: number
  totalSteps: number
  completionPercentage: number
  isFullySetup: boolean
}

export function OnboardingAnalyticsView() {
  const [tenants, setTenants] = useState<TenantStatus[]>([])
  const [funnelMetrics, setFunnelMetrics] = useState<any>(null)
  const [dropOffPoints, setDropOffPoints] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/super-admin/onboarding-analytics")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setTenants(data.tenants || [])
      setFunnelMetrics(data.funnelMetrics || {})
      setDropOffPoints(data.dropOffPoints || {})
    } catch (error) {
      console.error("[v0] Error loading onboarding analytics:", error)
      setTenants([])
      setFunnelMetrics({
        totalTenants: 0,
        fullySetup: 0,
        fullySetupPercentage: 0,
        withLeadAdmin: 0,
        withLeadAdminPercentage: 0,
        withAccessCode: 0,
        withAccessCodePercentage: 0,
        withSlack: 0,
        withSlackPercentage: 0,
      })
      setDropOffPoints({
        afterSignup: 0,
        afterLeadAdmin: 0,
        afterAccessCode: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading onboarding analytics...</div>
  }

  if (!funnelMetrics || !dropOffPoints) {
    return <div className="p-8">No analytics data available</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Onboarding Analytics</h1>
        <p className="text-muted-foreground">Track church setup completion and identify drop-off points</p>
      </div>

      {/* Funnel Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Churches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funnelMetrics.totalTenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Lead Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funnelMetrics.withLeadAdmin}</div>
            <p className="text-xs text-muted-foreground">
              {funnelMetrics.withLeadAdminPercentage?.toFixed(1) || "0.0"}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Access Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funnelMetrics.withAccessCode}</div>
            <p className="text-xs text-muted-foreground">
              {funnelMetrics.withAccessCodePercentage?.toFixed(1) || "0.0"}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fully Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{funnelMetrics.fullySetup}</div>
            <p className="text-xs text-muted-foreground">{funnelMetrics.fullySetupPercentage?.toFixed(1) || "0.0"}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle>Drop-off Points</CardTitle>
          <CardDescription>Churches that didn't complete each step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="font-medium">After Signup (No Lead Admin)</span>
            </div>
            <Badge variant="destructive">{dropOffPoints.afterSignup} churches</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              <span className="font-medium">After Lead Admin (No Access Code)</span>
            </div>
            <Badge variant="destructive">{dropOffPoints.afterLeadAdmin} churches</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">After Access Code (No Slack)</span>
            </div>
            <Badge variant="destructive">{dropOffPoints.afterAccessCode} churches</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Church Setup Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Church Setup Status</CardTitle>
          <CardDescription>Detailed view of each church's onboarding progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Church Name</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Lead Admin</TableHead>
                <TableHead>Access Code</TableHead>
                <TableHead>Slack</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={tenant.completionPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {tenant.completedSteps}/{tenant.totalSteps} steps
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.setupStatus.hasLeadAdmin ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant.setupStatus.hasAccessCode ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {tenant.setupStatus.hasSlack ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(tenant.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
