"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2, RefreshCw, Hash, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateChannelDialog } from "./create-channel-dialog"

interface SlackChannelsListProps {
  slackConfig: any
  churchTenantId: string
}

export function SlackChannelsList({ slackConfig, churchTenantId }: SlackChannelsListProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [savedChannels, setSavedChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (slackConfig) {
      loadChannels()
    }
  }, [slackConfig])

  async function loadChannels() {
    try {
      console.log("[v0] Loading channels for tenant:", churchTenantId)

      // Load saved channels from database
      const { data: saved } = await supabase
        .from("slack_channels")
        .select("*")
        .eq("slack_integration_id", slackConfig.id)
        .order("channel_name")

      console.log("[v0] Saved channels:", saved?.length || 0)
      setSavedChannels(saved || [])

      // Fetch channels from Slack API
      await fetchSlackChannels()
    } catch (error) {
      console.error("[v0] Error loading channels:", error)
      setError("Failed to load channels")
    } finally {
      setLoading(false)
    }
  }

  async function fetchSlackChannels() {
    try {
      console.log("[v0] Fetching channels from Slack API...")
      const response = await fetch(`/api/slack/channels?tenantId=${churchTenantId}`)
      const data = await response.json()

      console.log("[v0] API response:", data)

      if (!response.ok) {
        setError(data.error || "Failed to fetch channels")
        throw new Error(data.error || "Failed to fetch channels")
      }

      console.log("[v0] Channels received:", data.channels?.length || 0)
      setChannels(data.channels || [])
      setError(null)
    } catch (error: any) {
      console.error("[v0] Error fetching Slack channels:", error)
      setError(error.message || "Failed to fetch channels from Slack")
    }
  }

  async function syncChannels() {
    setSyncing(true)
    setError(null)
    try {
      console.log("[v0] 🔵 CLIENT: Starting channel sync...")
      console.log("[v0] 🔵 CLIENT: Fetching channels from Slack API...")

      await fetchSlackChannels()

      if (channels.length > 0) {
        console.log("[v0] 🔵 CLIENT: Calling sync API with", channels.length, "channels")
        console.log("[v0] 🔵 CLIENT: Slack integration ID:", slackConfig.id)

        const response = await fetch("/api/slack/channels/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slackIntegrationId: slackConfig.id,
            channels: channels,
          }),
        })

        const data = await response.json()
        console.log("[v0] 🔵 CLIENT: Sync API response:", data)

        if (!response.ok) {
          console.log("[v0] 🔴 CLIENT: Sync API returned error:", data.error)
          throw new Error(data.error || "Failed to sync channels")
        }

        console.log("[v0] 🟢 CLIENT: Sync successful, reloading channels...")
        await loadChannels()

        toast({
          title: "Success",
          description: `Synced ${data.synced} new channel(s) from Slack`,
        })

        console.log("[v0] 🟢 CLIENT: Sync process completed successfully")
      } else {
        console.log("[v0] 🟡 CLIENT: No channels to sync")
      }
    } catch (error: any) {
      console.error("[v0] 🔴 CLIENT: Error syncing channels:", error)
      setError(error.message || "Failed to sync channels")
      toast({
        title: "Error",
        description: error.message || "Failed to sync channels",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const isMissingScopeError = error?.includes("missing_scope")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Slack Channels</h3>
          <p className="text-sm text-muted-foreground">
            Channels from your Slack workspace that can receive notifications
          </p>
        </div>
        <div className="flex gap-2">
          <CreateChannelDialog churchTenantId={churchTenantId} onChannelCreated={loadChannels} />
          <Button onClick={syncChannels} disabled={syncing} variant="outline">
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync Channels
          </Button>
        </div>
      </div>

      {error && isMissingScopeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Slack Permissions</AlertTitle>
          <AlertDescription>
            <div className="space-y-3 mt-2">
              <p className="text-sm">
                Your Slack bot token doesn't have the required permissions to access channels. Follow these steps to fix
                it:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside ml-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    api.slack.com/apps
                    <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and select your app
                </li>
                <li>Click on "OAuth & Permissions" in the left sidebar</li>
                <li>
                  Scroll to "Scopes" → "Bot Token Scopes" and add these scopes:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                    <li>
                      <code className="bg-background px-1 rounded text-xs">channels:read</code> - View basic channel
                      info
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded text-xs">groups:read</code> - View private channels
                    </li>
                    <li>
                      <code className="bg-background px-1 rounded text-xs">chat:write</code> - Send messages
                    </li>
                  </ul>
                </li>
                <li>Click "Reinstall to Workspace" at the top of the page</li>
                <li>Copy the new "Bot User OAuth Token" (starts with xoxb-)</li>
                <li>Go to the Settings tab and update your Bot Token with the new token</li>
                <li>Come back here and click "Sync Channels" again</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && !isMissingScopeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">{error}</p>
              <div className="text-sm space-y-1">
                <p>Troubleshooting tips:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check that your bot token is correct in the Settings tab</li>
                  <li>
                    Invite your bot to channels by typing{" "}
                    <code className="bg-background px-1 rounded">/invite @your-bot-name</code>
                  </li>
                  <li>Make sure your Slack app is installed to your workspace</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {channels.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold">No channels found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your Slack bot needs to be invited to channels before they appear here.
              </p>
              <div className="mt-4 text-left max-w-md mx-auto bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">To add your bot to channels:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open a channel in Slack</li>
                  <li>
                    Type <code className="bg-background px-1 rounded">/invite @your-bot-name</code>
                  </li>
                  <li>Click "Sync Channels" above to refresh</li>
                </ol>
              </div>
            </div>
            <Button onClick={syncChannels} variant="outline" className="mt-4 bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Channels
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => {
            const isSaved = savedChannels.find((sc) => sc.channel_id === channel.id)
            return (
              <Card key={channel.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">#{channel.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {channel.is_member ? "Bot is member" : "Public channel"}
                      </p>
                    </div>
                  </div>
                  {isSaved && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Synced</span>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
