"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function StripeConnectionSettings() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchStatus()

    // Check for success/refresh params
    if (searchParams.get("success")) {
      fetchStatus()
    }
  }, [searchParams])

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/giving/stripe-connect/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("[v0] Failed to fetch status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch("/api/giving/stripe-connect/create", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to connect" }))
        console.error("[v0] Failed to create connection:", errorData)
        alert(errorData.error || "Failed to connect to Stripe. Please try again.")
        setConnecting(false)
        return
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("[v0] No URL returned from Stripe")
        alert("Failed to get Stripe connection URL. Please try again.")
        setConnecting(false)
      }
    } catch (error) {
      console.error("[v0] Failed to create connection:", error)
      alert("An error occurred while connecting to Stripe. Please try again.")
      setConnecting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Stripe Connection</h2>

      {status?.connected && status?.active ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected and Active</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your Stripe account is connected and ready to accept donations.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charges Enabled:</span>
              <span className="font-medium">Yes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payouts Enabled:</span>
              <span className="font-medium">{status.payouts_enabled ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      ) : status?.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Setup Incomplete</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your Stripe account is connected but needs additional setup to accept donations.
          </p>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Complete Setup
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Stripe account to start accepting donations. Your church will receive donations directly to
            your Stripe account.
          </p>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect Stripe Account
          </Button>
        </div>
      )}
    </Card>
  )
}
