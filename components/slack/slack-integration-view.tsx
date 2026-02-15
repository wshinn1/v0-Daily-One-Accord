"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlackChannelsList } from "./slack-channels-list"
import { SlackNotificationSettings } from "./slack-notification-settings"
import { SlackSetupWizard } from "./slack-setup-wizard"
import { KanbanNotificationSettings } from "./kanban-notification-settings"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SlackIntegrationViewProps {
  churchTenantId: string
}

export function SlackIntegrationView({ churchTenantId }: SlackIntegrationViewProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slackConfig, setSlackConfig] = useState<any>(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [botToken, setBotToken] = useState("")
  const [connected, setConnected] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadSlackConfig()
  }, [churchTenantId])

  async function loadSlackConfig() {
    try {
      console.log("[v0] 🔍 Loading Slack config for tenant:", churchTenantId)

      const response = await fetch(`/api/slack/config?tenantId=${churchTenantId}`)
      const result = await response.json()

      console.log("[v0] 📡 API response:", {
        status: response.status,
        hasData: !!result.data,
        error: result.error,
      })

      if (result.data) {
        console.log("[v0] 📊 Full Slack config data:", result.data)
        console.log("[v0] 🔑 Key fields:", {
          id: result.data.id,
          church_tenant_id: result.data.church_tenant_id,
          is_active: result.data.is_active,
          has_webhook: !!result.data.webhook_url,
          has_bot_token: !!result.data.bot_token,
        })

        console.log("[v0] ✅ Slack config loaded successfully")
        setSlackConfig(result.data)
        setWebhookUrl(result.data.webhook_url || "")
        setBotToken(result.data.bot_token || "")

        const isConnected = result.data.is_active || false
        console.log("[v0] 🔌 Setting connected state to:", isConnected)
        setConnected(isConnected)
      } else {
        console.log("[v0] ⚠️ No Slack config found for tenant")
        setSlackConfig(null)
        setConnected(false)
      }
    } catch (error) {
      console.error("[v0] ❌ Error loading Slack config:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveConfig() {
    setSaving(true)
    try {
      if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
        alert("Invalid Webhook URL. It should start with 'https://hooks.slack.com/'")
        setSaving(false)
        return
      }

      if (!botToken.startsWith("xoxb-")) {
        alert("Invalid Bot Token. It should start with 'xoxb-' (Bot User OAuth Token, not a webhook URL)")
        setSaving(false)
        return
      }

      console.log("[v0] 💾 Saving Slack config for tenant:", churchTenantId)

      const configData = {
        church_tenant_id: churchTenantId,
        webhook_url: webhookUrl,
        bot_token: botToken,
        is_active: true,
        workspace_id: "manual",
      }

      const response = await fetch("/api/slack/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save configuration")
      }

      console.log("[v0] ✅ Slack config saved successfully")
      setConnected(true)
      await loadSlackConfig()
    } catch (error) {
      console.error("[v0] ❌ Error saving Slack config:", error)
      alert(`Failed to save Slack configuration: ${error.message || "Please try again."}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleWizardComplete(webhookUrl: string, botToken: string) {
    setWebhookUrl(webhookUrl)
    setBotToken(botToken)
    setShowWizard(false)
    // Auto-save after wizard completion
    setSaving(true)
    try {
      const configData = {
        church_tenant_id: churchTenantId,
        webhook_url: webhookUrl,
        bot_token: botToken,
        is_active: true,
        workspace_id: "manual",
      }

      const response = await fetch("/api/slack/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save configuration")
      }

      setConnected(true)
      await loadSlackConfig()
    } catch (error) {
      console.error("[v0] ❌ Error saving Slack config:", error)
      alert("Failed to save Slack configuration. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnect() {
    setSaving(true)
    try {
      console.log("[v0] 🔌 Disconnecting Slack for tenant:", churchTenantId)

      const response = await fetch("/api/slack/config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: churchTenantId }),
      })

      if (!response.ok) {
        throw new Error("Failed to disconnect")
      }

      console.log("[v0] ✅ Slack disconnected successfully")
      setConnected(false)
      await loadSlackConfig()
    } catch (error) {
      console.error("[v0] ❌ Error disconnecting Slack:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slack Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your church's Slack workspace to receive notifications and manage communications
          </p>
        </div>
        <SlackSetupWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Slack Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your church's Slack workspace to receive notifications and manage communications
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="channels" disabled={!connected}>
            Channels
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled={!connected}>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="kanban" disabled={!connected}>
            Kanban
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Connect Slack Workspace</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To connect your Slack workspace, you'll need to create a Slack app and configure webhooks.
                </p>
                {connected && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ Slack workspace connected
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook">Incoming Webhook URL</Label>
                  <Input
                    id="webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    disabled={connected}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must start with https://hooks.slack.com/services/ - Create this in your Slack app's "Incoming
                    Webhooks" section
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Bot User OAuth Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="xoxb-1234567890-1234567890123-..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    disabled={connected}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must start with xoxb- (NOT a webhook URL) - Found in "OAuth & Permissions" section under "Bot User
                    OAuth Token"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {!connected ? (
                  <>
                    <Button variant="outline" onClick={() => setShowWizard(true)}>
                      Setup Wizard
                    </Button>
                    <Button onClick={handleSaveConfig} disabled={saving || !webhookUrl || !botToken}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Connect Slack
                    </Button>
                  </>
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
                      href="https://api.slack.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      api.slack.com/apps
                    </a>
                  </li>
                  <li>Create a new app or select an existing one</li>
                  <li>Enable "Incoming Webhooks" and create a new webhook URL</li>
                  <li>Go to "OAuth & Permissions" and install the app to your workspace</li>
                  <li>Copy the "Bot User OAuth Token" (starts with xoxb-)</li>
                  <li>Paste both values above and click "Connect Slack"</li>
                </ol>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <SlackChannelsList slackConfig={slackConfig} churchTenantId={churchTenantId} />
        </TabsContent>

        <TabsContent value="notifications">
          <SlackNotificationSettings slackConfig={slackConfig} />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanNotificationSettings slackConfig={slackConfig} churchTenantId={churchTenantId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
