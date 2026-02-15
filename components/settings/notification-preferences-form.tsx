"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Mail, MessageSquare, Bell } from "lucide-react"

interface NotificationSettings {
  email?: {
    attendance?: boolean
    events?: boolean
    teams?: boolean
    newsletters?: boolean
    system?: boolean
  }
  sms?: {
    attendance?: boolean
    events?: boolean
    urgent?: boolean
  }
  slack?: {
    mentions?: boolean
    rundowns?: boolean
    attendance?: boolean
  }
  quietHours?: {
    enabled?: boolean
    startTime?: string
    endTime?: string
    timezone?: string
  }
  digest?: {
    enabled?: boolean
    frequency?: "daily" | "weekly" | "realtime"
    time?: string
  }
  channelRouting?: {
    urgent?: "email" | "sms" | "slack" | "all"
    normal?: "email" | "slack" | "both"
    lowPriority?: "email" | "digest"
  }
}

interface NotificationPreferencesFormProps {
  initialSettings: NotificationSettings
  userEmail: string
}

export function NotificationPreferencesForm({ initialSettings, userEmail }: NotificationPreferencesFormProps) {
  const [settings, setSettings] = useState<NotificationSettings>(
    initialSettings || {
      email: {
        attendance: true,
        events: true,
        teams: true,
        newsletters: true,
        system: true,
      },
      sms: {
        attendance: false,
        events: false,
        urgent: true,
      },
      slack: {
        mentions: true,
        rundowns: true,
        attendance: true,
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      digest: {
        enabled: false,
        frequency: "daily",
        time: "09:00",
      },
      channelRouting: {
        urgent: "all",
        normal: "both",
        lowPriority: "digest",
      },
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const updateSetting = (category: keyof NotificationSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/users/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_settings: settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="channels" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="channels">
          <Bell className="w-4 h-4 mr-2" />
          Channels
        </TabsTrigger>
        <TabsTrigger value="quiet-hours">
          <Clock className="w-4 h-4 mr-2" />
          Quiet Hours
        </TabsTrigger>
        <TabsTrigger value="digest">
          <Mail className="w-4 h-4 mr-2" />
          Digest
        </TabsTrigger>
        <TabsTrigger value="routing">
          <MessageSquare className="w-4 h-4 mr-2" />
          Routing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="channels" className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Receive notifications at {userEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Attendance Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified when attendance is recorded</p>
              </div>
              <Switch
                checked={settings.email?.attendance ?? true}
                onCheckedChange={(checked) => updateSetting("email", "attendance", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Reminders for upcoming events and services</p>
              </div>
              <Switch
                checked={settings.email?.events ?? true}
                onCheckedChange={(checked) => updateSetting("email", "events", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Team Updates</Label>
                <p className="text-sm text-muted-foreground">Updates about your ministry and volunteer teams</p>
              </div>
              <Switch
                checked={settings.email?.teams ?? true}
                onCheckedChange={(checked) => updateSetting("email", "teams", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Newsletters</Label>
                <p className="text-sm text-muted-foreground">Church newsletters and announcements</p>
              </div>
              <Switch
                checked={settings.email?.newsletters ?? true}
                onCheckedChange={(checked) => updateSetting("email", "newsletters", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Notifications</Label>
                <p className="text-sm text-muted-foreground">Important system updates and security alerts</p>
              </div>
              <Switch
                checked={settings.email?.system ?? true}
                onCheckedChange={(checked) => updateSetting("email", "system", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Notifications</CardTitle>
            <CardDescription>Text message notifications to your phone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Attendance Alerts</Label>
                <p className="text-sm text-muted-foreground">SMS alerts for attendance milestones</p>
              </div>
              <Switch
                checked={settings.sms?.attendance ?? false}
                onCheckedChange={(checked) => updateSetting("sms", "attendance", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">SMS reminders for events you're involved in</p>
              </div>
              <Switch
                checked={settings.sms?.events ?? false}
                onCheckedChange={(checked) => updateSetting("sms", "events", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Urgent Notifications</Label>
                <p className="text-sm text-muted-foreground">Critical alerts that require immediate attention</p>
              </div>
              <Switch
                checked={settings.sms?.urgent ?? true}
                onCheckedChange={(checked) => updateSetting("sms", "urgent", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Slack Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Slack Notifications</CardTitle>
            <CardDescription>Notifications in your Slack workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mentions</Label>
                <p className="text-sm text-muted-foreground">When someone mentions you in Slack</p>
              </div>
              <Switch
                checked={settings.slack?.mentions ?? true}
                onCheckedChange={(checked) => updateSetting("slack", "mentions", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rundown Updates</Label>
                <p className="text-sm text-muted-foreground">Service rundown changes and assignments</p>
              </div>
              <Switch
                checked={settings.slack?.rundowns ?? true}
                onCheckedChange={(checked) => updateSetting("slack", "rundowns", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Attendance Reports</Label>
                <p className="text-sm text-muted-foreground">Weekly attendance summaries</p>
              </div>
              <Switch
                checked={settings.slack?.attendance ?? true}
                onCheckedChange={(checked) => updateSetting("slack", "attendance", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quiet-hours" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>Pause non-urgent notifications during specific hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Mute notifications during your quiet hours</p>
              </div>
              <Switch
                checked={settings.quietHours?.enabled ?? false}
                onCheckedChange={(checked) => updateSetting("quietHours", "enabled", checked)}
              />
            </div>

            {settings.quietHours?.enabled && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={settings.quietHours?.startTime || "22:00"}
                      onChange={(e) => updateSetting("quietHours", "startTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={settings.quietHours?.endTime || "08:00"}
                      onChange={(e) => updateSetting("quietHours", "endTime", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    value={settings.quietHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={(e) => updateSetting("quietHours", "timezone", e.target.value)}
                    placeholder="America/New_York"
                  />
                  <p className="text-sm text-muted-foreground">
                    Current timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    <strong>Note:</strong> Urgent notifications will still be delivered during quiet hours.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="digest" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Digest</CardTitle>
            <CardDescription>Receive grouped notifications instead of individual alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Digest</Label>
                <p className="text-sm text-muted-foreground">Group low-priority notifications into a digest</p>
              </div>
              <Switch
                checked={settings.digest?.enabled ?? false}
                onCheckedChange={(checked) => updateSetting("digest", "enabled", checked)}
              />
            </div>

            {settings.digest?.enabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Digest Frequency</Label>
                  <Select
                    value={settings.digest?.frequency || "daily"}
                    onValueChange={(value) => updateSetting("digest", "frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (no digest)</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.digest?.frequency !== "realtime" && (
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <Input
                      type="time"
                      value={settings.digest?.time || "09:00"}
                      onChange={(e) => updateSetting("digest", "time", e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      {settings.digest?.frequency === "daily"
                        ? "Receive your daily digest at this time"
                        : "Receive your weekly digest on Monday at this time"}
                    </p>
                  </div>
                )}

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    <strong>What's included:</strong> Team updates, newsletters, attendance reports, and other
                    low-priority notifications will be grouped into your digest.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="routing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Channel Routing</CardTitle>
            <CardDescription>Choose how different types of notifications are delivered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Urgent Notifications</Label>
              <Select
                value={settings.channelRouting?.urgent || "all"}
                onValueChange={(value) => updateSetting("channelRouting", "urgent", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="sms">SMS only</SelectItem>
                  <SelectItem value="slack">Slack only</SelectItem>
                  <SelectItem value="all">All channels</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Critical alerts that require immediate attention</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Normal Priority</Label>
              <Select
                value={settings.channelRouting?.normal || "both"}
                onValueChange={(value) => updateSetting("channelRouting", "normal", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email only</SelectItem>
                  <SelectItem value="slack">Slack only</SelectItem>
                  <SelectItem value="both">Email and Slack</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Event reminders, team updates, and rundown changes</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Low Priority</Label>
              <Select
                value={settings.channelRouting?.lowPriority || "digest"}
                onValueChange={(value) => updateSetting("channelRouting", "lowPriority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email immediately</SelectItem>
                  <SelectItem value="digest">Include in digest</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Newsletters, attendance reports, and general updates</p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm">
                <strong>Tip:</strong> Use channel routing to reduce notification fatigue while staying informed about
                what matters most.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </Tabs>
  )
}
