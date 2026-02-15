"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduledSmsListProps {
  scheduledSms: any[]
  churchTenantId: string
}

export function ScheduledSmsList({ scheduledSms, churchTenantId }: ScheduledSmsListProps) {
  const { toast } = useToast()

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(`/api/sms/schedule/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel scheduled SMS")
      }

      toast({
        title: "SMS cancelled",
        description: "The scheduled message has been cancelled",
      })

      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel SMS",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      sending: "default",
      sent: "outline",
      failed: "destructive",
      cancelled: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  if (scheduledSms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No scheduled messages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {scheduledSms.map((sms) => (
        <Card key={sms.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {sms.event?.title || "General Notification"}
                  {getStatusBadge(sms.status)}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(sms.scheduled_for).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {sms.recipient_type.replace("_", " ")}
                  </span>
                </CardDescription>
              </div>
              {sms.status === "pending" && (
                <Button variant="ghost" size="sm" onClick={() => handleCancel(sms.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{sms.message}</p>
            {sms.status === "sent" && (
              <div className="mt-2 text-xs text-muted-foreground">
                Sent to {sms.sent_count} recipients
                {sms.failed_count > 0 && ` (${sms.failed_count} failed)`}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
