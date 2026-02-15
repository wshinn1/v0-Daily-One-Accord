"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ExternalLink, AlertCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface GroupMeSetupProps {
  tenantId: string
}

export function GroupMeSetup({ tenantId }: GroupMeSetupProps) {
  const [accessToken, setAccessToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const supabase = getSupabaseBrowserClient()

  const handleSave = async () => {
    if (!accessToken.trim()) {
      setError("Please enter a GroupMe access token")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Save the access token to the church tenant
      const { error: updateError } = await supabase
        .from("church_tenants")
        .update({ groupme_access_token: accessToken })
        .eq("id", tenantId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Error saving GroupMe token:", err)
      setError("Failed to save GroupMe access token. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To connect GroupMe, you need an access token from your GroupMe account. This will allow you to bridge messages
          between Slack and GroupMe groups.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupme_token">GroupMe Access Token</Label>
          <Input
            id="groupme_token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter your GroupMe access token"
          />
          <p className="text-xs text-muted-foreground">
            Your access token will be stored securely and used to connect to GroupMe groups
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">GroupMe access token saved successfully!</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSave} disabled={loading || !accessToken.trim()} className="w-full">
          {loading ? "Saving..." : "Save Access Token"}
        </Button>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="font-medium text-sm">How to get your GroupMe Access Token:</h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Go to the GroupMe Developer Portal</li>
          <li>Log in with your GroupMe account</li>
          <li>Click "Access Token" in the top right corner</li>
          <li>Copy the token and paste it above</li>
        </ol>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <a href="https://dev.groupme.com/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open GroupMe Developer Portal
          </a>
        </Button>
      </div>
    </div>
  )
}
