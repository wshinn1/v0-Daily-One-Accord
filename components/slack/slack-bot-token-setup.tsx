"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"

interface SlackBotTokenSetupProps {
  churchId: string
  churchName: string
  isConfigured: boolean
  onClose: () => void
}

export function SlackBotTokenSetup({ churchId, churchName, isConfigured, onClose }: SlackBotTokenSetupProps) {
  const [botToken, setBotToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!botToken.trim()) {
      setError("Please enter a bot token")
      return
    }

    if (!botToken.startsWith("xoxb-")) {
      setError("Bot token should start with 'xoxb-'")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/slack/save-bot-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchId,
          botToken,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save bot token")
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError("Failed to save bot token. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Configure Slack Chat for {churchName}</CardTitle>
          <CardDescription>Enter your Slack Bot Token to enable embedded chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Slack chat configured successfully! Refreshing page...</AlertDescription>
            </Alert>
          ) : (
            <>
              {isConfigured && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Slack chat is already configured. You can update the bot token below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Slack Bot Token</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="xoxb-..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Your bot token starts with "xoxb-"</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-sm">How to get your Bot Token:</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>
                      Go to{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        api.slack.com/apps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Select your Slack App</li>
                    <li>Go to "OAuth & Permissions"</li>
                    <li>
                      Make sure these Bot Token Scopes are added:
                      <ul className="ml-6 mt-1 text-xs space-y-1">
                        <li>• channels:history</li>
                        <li>• channels:read</li>
                        <li>• chat:write</li>
                        <li>• users:read</li>
                        <li>• groups:history</li>
                        <li>• groups:read</li>
                      </ul>
                    </li>
                    <li>Click "Install to Workspace" (or "Reinstall")</li>
                    <li>Copy the "Bot User OAuth Token" (starts with xoxb-)</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Bot Token"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
