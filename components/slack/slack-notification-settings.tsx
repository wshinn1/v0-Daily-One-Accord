"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createBrowserClient } from "@supabase/ssr"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface SlackNotificationSettingsProps {
  slackConfig: any
}

export function SlackNotificationSettings({ slackConfig }: SlackNotificationSettingsProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({
    new_visitor: { enabled: false, channel_id: "" },
    event_registration: { enabled: false, channel_id: "" },
    attendance_milestone: { enabled: false, channel_id: "" },
    new_volunteer: { enabled: false, channel_id: "" },
    visitor_comment_mention: { enabled: false, channel_id: "" },
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (slackConfig) {
      loadData()
    }
  }, [slackConfig])

  async function loadData() {
    try {
      const { data: channelsData } = await supabase
        .from("slack_channels")
        .select("*")
        .eq("slack_integration_id", slackConfig.id)

      setChannels(channelsData || [])

      if (slackConfig.notification_settings) {
        setSettings(slackConfig.notification_settings)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateSetting(key: string, field: string, value: any) {
    console.log("[v0 SETTINGS] Updating setting:", { key, field, value })
    console.log("[v0 SETTINGS] Current settings:", settings)
    console.log("[v0 SETTINGS] Slack config ID:", slackConfig.id)

    const newSettings = {
      ...settings,
      [key]: {
        ...settings[key],
        [field]: value,
      },
    }

    console.log("[v0 SETTINGS] New settings to save:", newSettings)
    setSettings(newSettings)

    try {
      const { data, error } = await supabase
        .from("slack_integrations")
        .update({ notification_settings: newSettings })
        .eq("id", slackConfig.id)
        .select()

      console.log("[v0 SETTINGS] Update response:", { data, error })

      if (error) {
        console.error("[v0 SETTINGS] Error updating settings:", error)
        toast({
          title: "Error",
          description: `Failed to save notification settings: ${error.message}`,
          variant: "destructive",
        })
      } else {
        console.log("[v0 SETTINGS] Settings saved successfully!")
        toast({
          title: "Success",
          description: "Notification settings saved",
        })
      }
    } catch (error) {
      console.error("[v0 SETTINGS] Exception updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const notificationTypes = [
    {
      key: "new_visitor",
      label: "New Visitor",
      description: "Send notification when a new visitor is added",
    },
    {
      key: "event_registration",
      label: "Event Registration",
      description: "Send notification when someone registers for an event",
    },
    {
      key: "attendance_milestone",
      label: "Attendance Milestone",
      description: "Send notification when attendance reaches a milestone",
    },
    {
      key: "new_volunteer",
      label: "New Volunteer",
      description: "Send notification when someone joins a volunteer team",
    },
    {
      key: "visitor_comment_mention",
      label: "Visitor Comment Mentions",
      description: "Send notification when someone is @mentioned in a visitor comment",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">Configure which events trigger Slack notifications</p>
      </div>

      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <Card key={type.key} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor={type.key}>{type.label}</Label>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <Switch
                  id={type.key}
                  checked={settings[type.key]?.enabled || false}
                  onCheckedChange={(checked) => updateSetting(type.key, "enabled", checked)}
                />
              </div>

              {settings[type.key]?.enabled && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Channel</Label>
                  <Select
                    value={settings[type.key]?.channel_id || ""}
                    onValueChange={(value) => updateSetting(type.key, "channel_id", value)}
                  >
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
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
