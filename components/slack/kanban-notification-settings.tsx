"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface SlackChannel {
  id: string
  channel_name: string
  channel_id: string
}

interface KanbanNotificationSettingsProps {
  slackConfig: any
  churchTenantId: string // Changed from channels array to churchTenantId
}

interface EventSettings {
  enabled: boolean
  channel_id: string
}

interface NotificationSettings {
  kanban?: EventSettings
  new_visitor?: EventSettings
  visitor_assignment?: EventSettings
  visitor_status_changed?: EventSettings
  visitor_comment_channel?: string
}

export function KanbanNotificationSettings({ slackConfig, churchTenantId }: KanbanNotificationSettingsProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([]) // Added channels state

  const [kanbanEnabled, setKanbanEnabled] = useState(false)
  const [kanbanChannelId, setKanbanChannelId] = useState("")

  const [visitorEnabled, setVisitorEnabled] = useState(false)
  const [visitorChannelId, setVisitorChannelId] = useState("")

  const [assignmentEnabled, setAssignmentEnabled] = useState(false)
  const [assignmentChannelId, setAssignmentChannelId] = useState("")

  const [statusChangeEnabled, setStatusChangeEnabled] = useState(false)
  const [statusChangeChannelId, setStatusChangeChannelId] = useState("")

  const [commentChannelId, setCommentChannelId] = useState("") // Added state for visitor comment channel

  const loadChannelsAndSettings = useCallback(async () => {
    try {
      console.log("[v0] 🔄 KanbanNotificationSettings v2.0 - Using slack_integration_id")
      console.log("[v0] 🔍 Loading channels for slack integration:", slackConfig.id)
      console.log("[v0] 📋 Query will use: slack_integration_id =", slackConfig.id)

      const { data: channelsData, error: channelsError } = await supabase
        .from("slack_channels")
        .select("*")
        .eq("slack_integration_id", slackConfig.id)

      if (channelsError) {
        console.error("[v0] ❌ Error loading channels:", channelsError)
        // Continue with empty channels array
        setChannels([])
      } else {
        console.log("[v0] ✅ Loaded", channelsData?.length || 0, "channels")
        setChannels(channelsData || [])
      }

      // Load saved settings
      console.log("[v0] 🔍 Loading saved settings for integration:", slackConfig.id)

      const { data, error } = await supabase
        .from("slack_integrations")
        .select("notification_settings")
        .eq("id", slackConfig.id)
        .single()

      if (error) {
        console.error("[v0] ❌ Error loading settings:", error)
        throw error
      }

      const settings: NotificationSettings = data?.notification_settings || {}
      console.log("[v0] ✅ Loaded notification settings:", settings)

      const kanbanSettings = settings.kanban || { enabled: false, channel_id: "" }
      setKanbanEnabled(kanbanSettings.enabled)
      setKanbanChannelId(kanbanSettings.channel_id || "")

      const visitorSettings = settings.new_visitor || { enabled: false, channel_id: "" }
      setVisitorEnabled(visitorSettings.enabled)
      setVisitorChannelId(visitorSettings.channel_id || "")

      const assignmentSettings = settings.visitor_assignment || { enabled: false, channel_id: "" }
      setAssignmentEnabled(assignmentSettings.enabled)
      setAssignmentChannelId(assignmentSettings.channel_id || "")

      const statusChangeSettings = settings.visitor_status_changed || { enabled: false, channel_id: "" }
      setStatusChangeEnabled(statusChangeSettings.enabled)
      setStatusChangeChannelId(statusChangeSettings.channel_id || "")

      setCommentChannelId(settings.visitor_comment_channel || "")
    } catch (error) {
      console.error("[v0] ❌ Error loading channels and settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [slackConfig.id])

  useEffect(() => {
    loadChannelsAndSettings() // Load both channels and settings
  }, [slackConfig.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log("[v0] Saving notification settings...")

      const notificationSettings: NotificationSettings = {
        kanban: {
          enabled: kanbanEnabled,
          channel_id: kanbanChannelId,
        },
        new_visitor: {
          enabled: visitorEnabled,
          channel_id: visitorChannelId,
        },
        visitor_assignment: {
          enabled: assignmentEnabled,
          channel_id: assignmentChannelId,
        },
        visitor_status_changed: {
          enabled: statusChangeEnabled,
          channel_id: statusChangeChannelId,
        },
        visitor_comment_channel: commentChannelId,
      }

      console.log("[v0] New settings to save:", notificationSettings)

      const { error } = await supabase
        .from("slack_integrations")
        .update({ notification_settings: notificationSettings })
        .eq("id", slackConfig.id)

      if (error) {
        console.error("[v0] Error saving settings:", error)
        throw error
      }

      console.log("[v0] Settings saved successfully!")

      toast({
        title: "Settings saved",
        description: "Notification settings have been updated",
      })
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Check console for details.",
        variant: "destructive",
      })
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Pipeline Notifications</CardTitle>
          <CardDescription>Get notified when new visitors are added or assigned to team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Visitor Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Visitor Added</Label>
                <p className="text-sm text-muted-foreground">Notify channel when a new visitor is added</p>
              </div>
              <Switch checked={visitorEnabled} onCheckedChange={setVisitorEnabled} />
            </div>

            {visitorEnabled && (
              <div className="space-y-2 pl-6">
                <Label>Notification Channel</Label>
                {channels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Slack channels found. Please sync channels from the Slack integration settings.
                  </p>
                ) : (
                  <Select value={visitorChannelId} onValueChange={setVisitorChannelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          #{channel.channel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Visitor Assignment Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visitor Assignment</Label>
                <p className="text-sm text-muted-foreground">Send DM when a visitor is assigned to someone</p>
              </div>
              <Switch checked={assignmentEnabled} onCheckedChange={setAssignmentEnabled} />
            </div>

            {assignmentEnabled && (
              <div className="space-y-2 pl-6">
                <p className="text-sm text-muted-foreground">
                  Direct messages will be sent to assigned team members via Slack
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Visitor Status Change Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visitor Status Changed</Label>
                <p className="text-sm text-muted-foreground">Notify when a visitor moves between pipeline stages</p>
              </div>
              <Switch checked={statusChangeEnabled} onCheckedChange={setStatusChangeEnabled} />
            </div>

            {statusChangeEnabled && (
              <div className="space-y-2 pl-6">
                <Label>Notification Channel</Label>
                {channels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Slack channels found. Please sync channels from the Slack integration settings.
                  </p>
                ) : (
                  <Select value={statusChangeChannelId} onValueChange={setStatusChangeChannelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          #{channel.channel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Visitor Comment Mentions Notifications */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <Label>Visitor Comment Mentions</Label>
              <p className="text-sm text-muted-foreground">
                Notify team members in Slack when they're mentioned in visitor comments
              </p>
            </div>

            <div className="space-y-2 pl-6">
              <Label>Notification Channel</Label>
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Slack channels found. Please sync channels from the Slack integration settings.
                </p>
              ) : (
                <Select value={commentChannelId} onValueChange={setCommentChannelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        #{channel.channel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Note: Team members must have their Slack user ID mapped in Settings → Team to receive mentions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Kanban Board Notifications</CardTitle>
          <CardDescription>Get notified when cards are created, moved, or assigned</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Kanban Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates about kanban board activity</p>
            </div>
            <Switch checked={kanbanEnabled} onCheckedChange={setKanbanEnabled} />
          </div>

          {kanbanEnabled && (
            <div className="space-y-2">
              <Label>Notification Channel</Label>
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Slack channels found. Please sync channels from the Slack integration settings.
                </p>
              ) : (
                <Select value={kanbanChannelId} onValueChange={setKanbanChannelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        #{channel.channel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={
          saving ||
          (visitorEnabled && !visitorChannelId) ||
          (kanbanEnabled && !kanbanChannelId) ||
          (statusChangeEnabled && !statusChangeChannelId)
        }
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  )
}
