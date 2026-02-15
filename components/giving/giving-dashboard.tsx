"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"
import Link from "next/link"

export function GivingDashboard() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchConnectionStatus()
    }
  }, [])

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch("/api/giving/stripe-connect/status")

      if (!response.ok) {
        console.error("[v0] Failed to fetch connection status: HTTP", response.status)
        // If not connected, show connection prompt
        setConnectionStatus({ connected: false })
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Response is not JSON:", contentType)
        setConnectionStatus({ connected: false })
        return
      }

      const data = await response.json()
      setConnectionStatus(data)
    } catch (error) {
      console.error("[v0] Failed to fetch connection status:", error)
      setConnectionStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!connectionStatus?.connected || !connectionStatus?.active) {
    return (
      <Card className="p-8 text-center">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Connect Stripe to Get Started</h2>
        <p className="text-muted-foreground mb-6">
          Connect your Stripe account to start accepting donations and managing your church's giving.
        </p>
        <Button asChild>
          <Link href="/dashboard/giving/settings">Connect Stripe Account</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Giving</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Donors</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Gift</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/dashboard/giving/funds">Manage Funds</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/dashboard/giving/campaigns">View Campaigns</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/dashboard/giving/donors">View Donors</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/dashboard/giving/settings">Settings</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
          <p className="text-sm text-muted-foreground">No donations yet</p>
        </Card>
      </div>
    </div>
  )
}
