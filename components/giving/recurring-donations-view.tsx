"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Repeat, Search, TrendingUp, AlertCircle } from "lucide-react"

interface RecurringDonation {
  id: string
  amount: number
  currency: string
  interval: string
  interval_count: number
  status: string
  start_date: string
  next_payment_date: string | null
  total_donations: number
  total_amount: number
  last_donation_date: string | null
  donors: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  }
  giving_funds: {
    id: string
    name: string
    color: string | null
  } | null
}

interface RecurringDonationsViewProps {
  recurringDonations: RecurringDonation[]
}

export function RecurringDonationsView({ recurringDonations }: RecurringDonationsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Calculate metrics
  const activeSubscriptions = recurringDonations.filter((d) => d.status === "active").length
  const monthlyRecurringRevenue = recurringDonations
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

  const pastDueCount = recurringDonations.filter((d) => d.status === "past_due").length

  // Filter donations
  const filteredDonations = recurringDonations.filter((donation) => {
    const matchesSearch =
      donation.donors.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${donation.donors.first_name} ${donation.donors.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || donation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      past_due: "destructive",
      canceled: "secondary",
      paused: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>
  }

  const formatInterval = (interval: string, count: number) => {
    const intervalText = count > 1 ? `${count} ${interval}s` : interval
    return intervalText
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recurring Donations</h1>
        <p className="text-muted-foreground">Manage subscription-based giving</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">{recurringDonations.length} total subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(monthlyRecurringRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastDueCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Donations</CardTitle>
          <CardDescription>View and manage all recurring donation subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Total Given</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No recurring donations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {donation.donors.first_name} {donation.donors.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{donation.donors.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${(donation.amount / 100).toFixed(2)}</TableCell>
                      <TableCell>{formatInterval(donation.interval, donation.interval_count)}</TableCell>
                      <TableCell>
                        {donation.giving_funds ? (
                          <div className="flex items-center gap-2">
                            {donation.giving_funds.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: donation.giving_funds.color }}
                              />
                            )}
                            <span>{donation.giving_funds.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        {donation.next_payment_date ? new Date(donation.next_payment_date).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${(donation.total_amount / 100).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{donation.total_donations} payments</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
