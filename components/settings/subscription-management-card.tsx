"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Users,
  TrendingUp,
  Loader2,
  Plus,
  Minus,
  FileText,
  Download,
  ExternalLink,
  Shield,
} from "lucide-react"
import { PLAN_DETAILS, type PlanType } from "@/lib/stripe/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubscriptionData {
  plan: PlanType
  seats: number
  additionalSeats: number
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  billingExempt?: boolean
  billingExemptReason?: string
}

interface Invoice {
  id: string
  number: string | null
  amount: number
  currency: string
  status: string | null
  created: number
  pdfUrl: string | null
  hostedUrl: string | null
  periodStart: number
  periodEnd: number
}

interface SubscriptionManagementCardProps {
  churchTenantId: string
}

export function SubscriptionManagementCard({ churchTenantId }: SubscriptionManagementCardProps) {
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("starter")
  const [seatAdjustment, setSeatAdjustment] = useState(0)
  const [changePlanOpen, setChangePlanOpen] = useState(false)
  const [addSeatsOpen, setAddSeatsOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  useEffect(() => {
    fetchSubscription()
    fetchInvoices()
  }, [churchTenantId])

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscription?tenantId=${churchTenantId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
        setSelectedPlan(data.plan)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      toast({
        title: "Failed to load subscription details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    setLoadingInvoices(true)
    try {
      const response = await fetch(`/api/subscription/invoices?tenantId=${churchTenantId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleChangePlan = async () => {
    if (!subscription || selectedPlan === subscription.plan) return

    setUpdating(true)
    try {
      const response = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: churchTenantId,
          newPlan: selectedPlan,
        }),
      })

      if (response.ok) {
        toast({
          title: "Plan updated successfully!",
          description: "Changes will be reflected in your next billing cycle.",
        })
        setChangePlanOpen(false)
        fetchSubscription()
      } else {
        const error = await response.json()
        toast({
          title: error.error || "Failed to update plan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing plan:", error)
      toast({
        title: "Failed to update plan",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateSeats = async () => {
    if (!subscription || seatAdjustment === 0) return

    setUpdating(true)
    try {
      const response = await fetch("/api/subscription/update-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: churchTenantId,
          seatChange: seatAdjustment,
        }),
      })

      if (response.ok) {
        toast({
          title: "Seats updated successfully!",
          description: "You'll be charged prorated for the additional seats.",
        })
        setAddSeatsOpen(false)
        setSeatAdjustment(0)
        fetchSubscription()
      } else {
        const error = await response.json()
        toast({
          title: error.error || "Failed to update seats",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating seats:", error)
      toast({
        title: "Failed to update seats",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (subscription?.billingExempt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>Your account billing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 mx-auto text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Billing Exempt</h3>
                <p className="text-sm text-green-700">
                  Your church has been granted complimentary access to Daily One Accord.
                </p>
                {subscription.billingExemptReason && (
                  <p className="text-sm text-muted-foreground mt-2">Reason: {subscription.billingExemptReason}</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">What this means:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full access to all features</li>
                <li>• No subscription charges</li>
                <li>• Unlimited seats for your team</li>
                <li>• Priority support included</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const planDetails = PLAN_DETAILS[subscription.plan]
  const totalSeats = planDetails.includedSeats + subscription.additionalSeats
  const monthlyTotal = planDetails.price + subscription.additionalSeats * (planDetails.additionalSeatPrice || 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your plan, seats, and view invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6 mt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold">{planDetails.name}</p>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
                <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Your Plan</DialogTitle>
                      <DialogDescription>
                        Select a new plan. Changes will be prorated and reflected in your next billing cycle.
                      </DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanType)}>
                      {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                        <div key={key} className="flex items-center space-x-2 border rounded-lg p-4">
                          <RadioGroupItem value={key} id={key} />
                          <Label htmlFor={key} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">{plan.includedSeats} seats included</p>
                              </div>
                              <p className="text-lg font-bold">${plan.price}/mo</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangePlanOpen(false)} disabled={updating}>
                        Cancel
                      </Button>
                      <Button onClick={handleChangePlan} disabled={updating || selectedPlan === subscription.plan}>
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Change
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Seats</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <p className="text-lg font-semibold">{totalSeats} seats</p>
                    {subscription.additionalSeats > 0 && (
                      <Badge variant="secondary">+{subscription.additionalSeats} additional</Badge>
                    )}
                  </div>
                </div>
                <Dialog open={addSeatsOpen} onOpenChange={setAddSeatsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Seats
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Team Seats</DialogTitle>
                      <DialogDescription>
                        Add or remove seats. Additional seats cost ${planDetails.additionalSeatPrice || 8}/month each.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Current Seats</p>
                          <p className="text-sm text-muted-foreground">
                            {planDetails.includedSeats} included + {subscription.additionalSeats} additional
                          </p>
                        </div>
                        <p className="text-2xl font-bold">{totalSeats}</p>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSeatAdjustment(Math.max(seatAdjustment - 1, -subscription.additionalSeats))}
                          disabled={seatAdjustment <= -subscription.additionalSeats}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-center min-w-[100px]">
                          <p className="text-3xl font-bold">
                            {seatAdjustment > 0 ? "+" : ""}
                            {seatAdjustment}
                          </p>
                          <p className="text-sm text-muted-foreground">seats</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setSeatAdjustment(seatAdjustment + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {seatAdjustment !== 0 && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium">New Total: {totalSeats + seatAdjustment} seats</p>
                          <p className="text-sm text-muted-foreground">
                            {seatAdjustment > 0
                              ? `+$${(planDetails.additionalSeatPrice || 8) * seatAdjustment}/month (prorated)`
                              : `Save $${Math.abs((planDetails.additionalSeatPrice || 8) * seatAdjustment)}/month`}
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddSeatsOpen(false)
                          setSeatAdjustment(0)
                        }}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateSeats} disabled={updating || seatAdjustment === 0}>
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Seats
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground">
                {planDetails.includedSeats} included, ${planDetails.additionalSeatPrice || 8}/month per additional seat
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${planDetails.price} plan + ${subscription.additionalSeats * (planDetails.additionalSeatPrice || 8)}{" "}
                additional seats
              </p>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{invoice.number || `Invoice ${invoice.id.slice(-8)}`}</p>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created * 1000).toLocaleDateString()} •
                        {new Date(invoice.periodStart * 1000).toLocaleDateString()} -{" "}
                        {new Date(invoice.periodEnd * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold">
                        ${invoice.amount.toFixed(2)} {invoice.currency}
                      </p>
                      <div className="flex gap-2">
                        {invoice.pdfUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </a>
                          </Button>
                        )}
                        {invoice.hostedUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
