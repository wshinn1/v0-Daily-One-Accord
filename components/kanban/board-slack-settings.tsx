"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Bell } from "lucide-react"

interface BoardSlackSettingsProps {
  boardId: string
  churchTenantId: string
}

export function BoardSlackSettings({ boardId, churchTenantId }: BoardSlackSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slackChannels, setSlackChannels] = useState<any[]>([])
  const [settings, setSettings] = useState({
    channel_id: "",
    channel_name: "",
    notify_on_card_created: true,
    notify_on_card_moved: true,
    notify_on_card_assigned: true,
    notify_on_comment_added: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [boardId])

  const fetchSettings = async () => {
    try {
      console.log("[v0] Fetching Slack settings for board:", boardId)

      const channelsResponse = await fetch(`/api/slack/channels?tenantId=${churchTenantId}`)
      if (channelsResponse.ok) {
        const data = await channelsResponse.json()
        const channels = data.channels || []
        console.log("[v0] Slack channels loaded:", channels.length)
        setSlackChannels(channels)
      } else {
        console.error("[v0] Error fetching Slack channels:", channelsResponse.status)
      }

      // Fetch board Slack settings
      const settingsResponse = await fetch(`/api/kanban/boards/${boardId}/slack-settings`)
      if (settingsResponse.ok) {
        const data = await settingsResponse.json()
        if (data) {
          console.log("[v0] Board Slack settings loaded")
          setSettings(data)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching Slack settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log("[v0] Saving Slack settings for board:", boardId)
      const response = await fetch(`/api/kanban/boards/${boardId}/slack-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        console.log("[v0] Slack settings saved successfully")
        alert("Slack settings saved successfully!")
      } else {
        const error = await response.json()
        console.error("[v0] Error saving Slack settings:", error)
        throw new Error(error.error || "Failed to save settings")
      }
    } catch (error: any) {
      console.error("[v0] Error saving Slack settings:", error)
      alert("Failed to save Slack settings: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (slackChannels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Slack Notifications
          </CardTitle>
          <CardDescription>Connect Slack first to enable notifications for this board</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Go to Settings → Integrations → Slack to connect your workspace.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Slack Notifications
        </CardTitle>
        <CardDescription>Configure Slack notifications for this board</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-2">
          <Label>Notification Channel</Label>
          <Select
            value={settings.channel_id}
            onValueChange={(value) => {
              const channel = slackChannels.find((ch) => ch.id === value)
              setSettings({
                ...settings,
                channel_id: value,
                channel_name: channel?.name || "",
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a channel" />
            </SelectTrigger>
            <SelectContent>
              {slackChannels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  #{channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose which Slack channel receives notifications</p>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-4">
          <Label>Notify When:</Label>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-created">Card Created</Label>
              <p className="text-xs text-muted-foreground">Send notification when a new card is created</p>
            </div>
            <Switch
              id="notify-created"
              checked={settings.notify_on_card_created}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notify_on_card_created: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-moved">Card Moved</Label>
              <p className="text-xs text-muted-foreground">Send notification when a card is moved to another column</p>
            </div>
            <Switch
              id="notify-moved"
              checked={settings.notify_on_card_moved}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notify_on_card_moved: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-assigned">Card Assigned</Label>
              <p className="text-xs text-muted-foreground">Send notification when a card is assigned to someone</p>
            </div>
            <Switch
              id="notify-assigned"
              checked={settings.notify_on_card_assigned}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notify_on_card_assigned: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-comment">Comment Added</Label>
              <p className="text-xs text-muted-foreground">Send notification when someone comments on a card</p>
            </div>
            <Switch
              id="notify-comment"
              checked={settings.notify_on_comment_added}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notify_on_comment_added: checked,
                })
              }
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !settings.channel_id}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
