"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Calendar, MessageSquare, Send, Settings } from "lucide-react"
import { ScheduleSmsDialog } from "./schedule-sms-dialog"
import { BulkSmsDialog } from "./bulk-sms-dialog"
import { ScheduledSmsList } from "./scheduled-sms-list"
import { BulkCampaignsList } from "./bulk-campaigns-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface SmsNotificationsViewProps {
  churchTenantId: string
  scheduledSms: any[]
  bulkCampaigns: any[]
  events: any[]
  smsConfigured: boolean
}

export function SmsNotificationsView({
  churchTenantId,
  scheduledSms,
  bulkCampaigns,
  events,
  smsConfigured,
}: SmsNotificationsViewProps) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

  if (!smsConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SMS Notifications</h2>
          <p className="text-muted-foreground">Schedule reminders and send bulk messages</p>
        </div>

        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            SMS is not configured for this church. Please{" "}
            <Link href="/dashboard/settings" className="font-medium underline">
              configure SMS settings
            </Link>{" "}
            to start sending notifications.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SMS Notifications</h2>
          <p className="text-muted-foreground">Schedule reminders and send bulk messages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setScheduleDialogOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule SMS
          </Button>
          <Button onClick={() => setBulkDialogOpen(true)} variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Send Bulk SMS
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Messages</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledSms.filter((s) => s.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Pending delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scheduledSms
                .filter((s) => s.status === "sent" && new Date(s.sent_at).toDateString() === new Date().toDateString())
                .reduce((sum, s) => sum + (s.sent_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Messages delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bulkCampaigns.filter((c) => c.status === "sending").length}</div>
            <p className="text-xs text-muted-foreground">Currently sending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled Messages</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledSmsList scheduledSms={scheduledSms} churchTenantId={churchTenantId} />
        </TabsContent>
        <TabsContent value="bulk" className="space-y-4">
          <BulkCampaignsList campaigns={bulkCampaigns} churchTenantId={churchTenantId} />
        </TabsContent>
      </Tabs>

      <ScheduleSmsDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        churchTenantId={churchTenantId}
        events={events}
      />

      <BulkSmsDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} churchTenantId={churchTenantId} />
    </div>
  )
}
