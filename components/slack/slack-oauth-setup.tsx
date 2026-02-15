"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, CheckCircle2, HelpCircle, Save } from "lucide-react"
import { SlackSetupGuide } from "./slack-setup-guide"

interface SlackOAuthSetupProps {
  churchId: string
  churchName: string
  isConfigured: boolean
  onClose: () => void
}

export function SlackOAuthSetup({ churchId, churchName, isConfigured, onClose }: SlackOAuthSetupProps) {
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [saving, setSaving] = useState(false)
  const [credentialsSaved, setCredentialsSaved] = useState(false)

  const handleSaveCredentials = async () => {
    if (!clientId || !clientSecret) {
      alert("Please enter both Client ID and Client Secret")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/slack/save-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchId,
          clientId,
          clientSecret,
        }),
      })

      if (!response.ok) throw new Error("Failed to save credentials")

      setCredentialsSaved(true)
      alert("Slack credentials saved successfully!")
    } catch (error) {
      console.error("Error saving credentials:", error)
      alert("Failed to save credentials. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleOAuthStart = async () => {
    if (!credentialsSaved && (!clientId || !clientSecret)) {
      alert("Please save your Slack credentials first")
      return
    }

    setLoading(true)
    const redirectUri = `${window.location.origin}/api/slack/oauth/callback`
    const state = btoa(JSON.stringify({ churchId }))

    const scopes = [
      "channels:history",
      "channels:read",
      "chat:write",
      "users:read",
      "groups:history",
      "groups:read",
      "im:history",
      "im:read",
      "mpim:history",
      "mpim:read",
    ].join(",")

    const oauthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      oauthUrl,
      "Slack OAuth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`,
    )

    if (!popup) {
      alert("Popup blocked! Please allow popups for this site and try again.")
      setLoading(false)
      return
    }

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setLoading(false)
        window.location.reload()
      }
    }, 1000)
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup Slack Chat Integration</DialogTitle>
            <DialogDescription>Connect {churchName}'s Slack workspace to enable embedded chat</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isConfigured ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Slack chat is already configured for this church. Members can use the embedded chat widget.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert>
                  <AlertDescription>
                    <strong>Setup Steps:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Create a Slack App (click "View Setup Guide" below)</li>
                      <li>Enter your Slack App credentials below</li>
                      <li>Save the credentials</li>
                      <li>Click "Connect Slack" to authorize</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowGuide(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  View Slack App Setup Guide
                </Button>

                <div className="space-y-4 border rounded-lg p-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Slack Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="Enter your Slack App Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      disabled={credentialsSaved}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Slack Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Enter your Slack App Client Secret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      disabled={credentialsSaved}
                    />
                  </div>

                  {!credentialsSaved && (
                    <Button onClick={handleSaveCredentials} disabled={saving} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Credentials"}
                    </Button>
                  )}

                  {credentialsSaved && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>Credentials saved! You can now connect to Slack.</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This will allow church members to access Slack channels directly within the app through an embedded
                    chat interface.
                  </p>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {!isConfigured && credentialsSaved && (
                <Button onClick={handleOAuthStart} disabled={loading}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {loading ? "Redirecting..." : "Connect Slack"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SlackSetupGuide
        open={showGuide}
        onOpenChange={setShowGuide}
        appDomain={typeof window !== "undefined" ? window.location.host : "your-app-domain.vercel.app"}
      />
    </>
  )
}
