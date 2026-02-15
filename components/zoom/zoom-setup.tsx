"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2, CheckCircle2 } from "lucide-react"

interface ZoomSetupProps {
  churchTenantId: string
}

export function ZoomSetup({ churchTenantId }: ZoomSetupProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connected, setConnected] = useState(false)
  const [accountId, setAccountId] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadZoomConfig()
  }, [churchTenantId])

  async function loadZoomConfig() {
    try {
      const { data } = await supabase
        .from("zoom_integrations")
        .select("*")
        .eq("church_tenant_id", churchTenantId)
        .maybeSingle()

      if (data) {
        setAccountId(data.account_id || "")
        setClientId(data.client_id || "")
        setClientSecret(data.client_secret || "")
        setConnected(data.is_active || false)
      }
    } catch (error) {
      console.error("Error loading Zoom config:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    if (!accountId || !clientId || !clientSecret) {
      alert("Please fill in all fields")
      return
    }

    setSaving(true)
    try {
      // Get OAuth token
      const tokenResponse = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "account_credentials",
          account_id: accountId,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Failed to authenticate with Zoom")
      }

      const tokenData = await tokenResponse.json()

      // Save to database
      const { error } = await supabase.from("zoom_integrations").upsert({
        church_tenant_id: churchTenantId,
        account_id: accountId,
        client_id: clientId,
        client_secret: clientSecret,
        access_token: tokenData.access_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_active: true,
      })

      if (error) throw error

      setConnected(true)
      alert("Zoom connected successfully!")
    } catch (error) {
      console.error("Error connecting Zoom:", error)
      alert("Failed to connect Zoom. Please check your credentials.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnect() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("zoom_integrations")
        .update({ is_active: false })
        .eq("church_tenant_id", churchTenantId)

      if (error) throw error

      setConnected(false)
    } catch (error) {
      console.error("Error disconnecting Zoom:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Zoom Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Zoom account to create and manage meetings from Slack
          </p>
          {connected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Zoom account connected</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              placeholder="Enter your Zoom Account ID"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={connected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="Enter your Zoom Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={connected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Enter your Zoom Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              disabled={connected}
            />
          </div>
        </div>

        <div className="flex gap-3">
          {!connected ? (
            <Button onClick={handleConnect} disabled={saving || !accountId || !clientId || !clientSecret}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Zoom
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleDisconnect} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">Setup Instructions</h4>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>
              Go to{" "}
              <a
                href="https://marketplace.zoom.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Zoom Marketplace
              </a>
            </li>
            <li>Click "Develop" → "Build App"</li>
            <li>Create a "Server-to-Server OAuth" app</li>
            <li>Copy your Account ID, Client ID, and Client Secret</li>
            <li>Add required scopes: meeting:write, meeting:read, user:read</li>
            <li>Paste the credentials above and click "Connect Zoom"</li>
          </ol>
        </div>

        {connected && (
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Using Zoom with Slack</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Once connected, you can create Zoom meetings from Slack using:</p>
              <code className="block bg-muted p-2 rounded mt-2">/zoom</code>
              <p className="mt-2">This will open a form to create instant or scheduled meetings.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
