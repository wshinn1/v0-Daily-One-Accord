"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, DollarSign, Users, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface Tenant {
  id: string
  name: string
  slug: string
  subscription_plan: string | null
  subscription_status: string | null
  mrr: number | null
  billing_exempt: boolean
  billing_exempt_reason: string | null
  created_at: string
  lead_admin: {
    id: string
    full_name: string
    email: string
  } | null
}

interface TenantsManagementViewProps {
  tenants: Tenant[]
}

export function TenantsManagementView({ tenants: initialTenants }: TenantsManagementViewProps) {
  const [tenants, setTenants] = useState(initialTenants)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [billingExempt, setBillingExempt] = useState(false)
  const [exemptionReason, setExemptionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const openBillingDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setBillingExempt(tenant.billing_exempt || false)
    setExemptionReason(tenant.billing_exempt_reason || "")
  }

  const handleSaveBillingExemption = async () => {
    if (!selectedTenant) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/super-admin/tenants/billing-exemption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          billingExempt,
          reason: exemptionReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to update billing exemption")

      const updatedTenant = await response.json()

      setTenants((prev) => prev.map((t) => (t.id === selectedTenant.id ? { ...t, ...updatedTenant } : t)))

      toast({
        title: "Billing exemption updated",
        description: `${selectedTenant.name} has been ${billingExempt ? "exempted from" : "enrolled in"} billing.`,
      })

      setSelectedTenant(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing exemption",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string | null, exempt: boolean) => {
    if (exempt) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Billing Exempt
        </Badge>
      )
    }

    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "trialing":
        return <Badge variant="secondary">Trial</Badge>
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>
      case "canceled":
        return <Badge variant="outline">Canceled</Badge>
      default:
        return <Badge variant="outline">Inactive</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Church Tenants</h1>
        <p className="text-muted-foreground">Manage church accounts and billing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.filter((t) => t.subscription_status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${tenants.reduce((sum, t) => sum + (t.billing_exempt ? 0 : t.mrr || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Exempt</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.filter((t) => t.billing_exempt).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Church Tenants</CardTitle>
          <CardDescription>View and manage church accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tenant.name}</h3>
                    {getStatusBadge(tenant.subscription_status, tenant.billing_exempt)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Plan: {tenant.subscription_plan || "None"}</span>
                    {!tenant.billing_exempt && tenant.mrr && <span>MRR: ${tenant.mrr.toFixed(2)}</span>}
                    {tenant.lead_admin && <span>Admin: {tenant.lead_admin.full_name}</span>}
                  </div>
                  {tenant.billing_exempt && tenant.billing_exempt_reason && (
                    <p className="text-sm text-muted-foreground">Exemption reason: {tenant.billing_exempt_reason}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => openBillingDialog(tenant)}>
                  Manage Billing
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Billing Exemption</DialogTitle>
            <DialogDescription>Configure billing exemption for {selectedTenant?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="billing-exempt" className="text-base">
                Billing Exempt
              </Label>
              <Switch id="billing-exempt" checked={billingExempt} onCheckedChange={setBillingExempt} />
            </div>

            {billingExempt && (
              <div className="space-y-2">
                <Label htmlFor="exemption-reason">Exemption Reason</Label>
                <Textarea
                  id="exemption-reason"
                  placeholder="e.g., Sponsored church, Beta tester, Partnership agreement..."
                  value={exemptionReason}
                  onChange={(e) => setExemptionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">What happens when billing exempt is enabled:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Stripe subscription will be canceled (if exists)</li>
                <li>Church will have full access to all features</li>
                <li>No charges will be made</li>
                <li>MRR will be set to $0</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTenant(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBillingExemption} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
