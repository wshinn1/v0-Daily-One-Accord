"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Eye, EyeOff } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const WEBHOOK_EVENTS = [
  { id: "member.created", label: "Member Created" },
  { id: "member.updated", label: "Member Updated" },
  { id: "member.deleted", label: "Member Deleted" },
  { id: "attendance.recorded", label: "Attendance Recorded" },
  { id: "event.created", label: "Event Created" },
  { id: "event.updated", label: "Event Updated" },
  { id: "class.enrolled", label: "Class Enrolled" },
  { id: "sms.sent", label: "SMS Sent" },
  { id: "newsletter.sent", label: "Newsletter Sent" },
]

interface Webhook {
  id: string
  name: string
  url: string
  secret: string
  events: string[]
  is_active: boolean
  created_at: string
  last_triggered_at?: string
  failure_count: number
}

interface WebhookManagementProps {
  hasPermission: boolean
}

export function WebhookManagement({ hasPermission }: WebhookManagementProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks")
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching webhooks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWebhook = async () => {
    if (!name || !url || selectedEvents.length === 0) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields and select at least one event",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, events: selectedEvents }),
      })

      if (!response.ok) {
        throw new Error("Failed to create webhook")
      }

      toast({
        title: "Webhook created",
        description: "Your webhook has been created successfully",
      })

      // Reset form
      setName("")
      setUrl("")
      setSelectedEvents([])

      // Refresh list
      fetchWebhooks()
    } catch (error) {
      console.error("[v0] Error creating webhook:", error)
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) => (prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]))
  }

  const toggleSecret = (webhookId: string) => {
    setShowSecret((prev) => ({ ...prev, [webhookId]: !prev[webhookId] }))
  }

  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            You don't have permission to manage webhooks. Contact your church administrator.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Webhook Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Webhook</CardTitle>
          <CardDescription>Configure a webhook to receive real-time event notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Webhook Name</Label>
            <Input
              id="name"
              placeholder="My Webhook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-2 gap-3">
              {WEBHOOK_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                    disabled={isCreating}
                  />
                  <label htmlFor={event.id} className="text-sm cursor-pointer">
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={createWebhook} disabled={isCreating} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Create Webhook"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>Manage your existing webhook configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading webhooks...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No webhooks configured yet</p>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{webhook.name}</h4>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                    </div>
                    <Badge variant={webhook.is_active ? "default" : "secondary"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Secret:</Label>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {showSecret[webhook.id] ? webhook.secret : "••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSecret(webhook.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showSecret[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>

                    {webhook.failure_count > 0 && (
                      <p className="text-xs text-destructive">Failed {webhook.failure_count} times</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
