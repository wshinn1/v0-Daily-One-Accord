"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, MessageSquare, Trash2, Play, Pause } from "lucide-react"
import { CreateAlertDialog } from "./create-alert-dialog"
import { AlertHistoryDialog } from "./alert-history-dialog"

interface ScheduledAlertsManagerProps {
  isAdmin: boolean
}

export function ScheduledAlertsManager({ isAdmin }: ScheduledAlertsManagerProps) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/scheduled-alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/scheduled-alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        await fetchAlerts()
      }
    } catch (error) {
      console.error("[v0] Error toggling alert:", error)
    }
  }

  const handleDelete = async (alertId: string) => {
    if (!confirm("Delete this alert?")) return

    try {
      const response = await fetch(`/api/scheduled-alerts/${alertId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAlerts()
      }
    } catch (error) {
      console.error("[v0] Error deleting alert:", error)
    }
  }

  const getScheduleDescription = (alert: any) => {
    switch (alert.schedule_type) {
      case "once":
        return `Once on ${new Date(alert.next_run_at).toLocaleDateString()}`
      case "daily":
        return `Daily at ${alert.schedule_time}`
      case "weekly":
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return `Weekly on ${days[alert.schedule_day_of_week]} at ${alert.schedule_time}`
      case "monthly":
        return `Monthly on day ${alert.schedule_day_of_month} at ${alert.schedule_time}`
      default:
        return "Unknown schedule"
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      )}

      {alerts.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <h3 className="text-lg font-semibold mb-2">No scheduled alerts</h3>
          <p className="text-muted-foreground mb-4">Create your first automated Slack notification</p>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{alert.name}</h3>
                    <Badge variant={alert.is_active ? "default" : "secondary"}>
                      {alert.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.channel_name || alert.channel_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{getScheduleDescription(alert)}</span>
                    </div>
                    {alert.last_run_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last run: {new Date(alert.last_run_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {alert.user_mentions && alert.user_mentions.length > 0 && (
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        Mentions {alert.user_mentions.length} user(s)
                      </Badge>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleToggleActive(alert.id, alert.is_active)} variant="outline" size="sm">
                      {alert.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedAlert(alert)
                        setShowHistoryDialog(true)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(alert.id)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateAlertDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false)
            fetchAlerts()
          }}
        />
      )}

      {showHistoryDialog && selectedAlert && (
        <AlertHistoryDialog
          isOpen={showHistoryDialog}
          onClose={() => {
            setShowHistoryDialog(false)
            setSelectedAlert(null)
          }}
          alertId={selectedAlert.id}
          alertName={selectedAlert.name}
        />
      )}
    </div>
  )
}
