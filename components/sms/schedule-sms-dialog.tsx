"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ScheduleSmsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchTenantId: string
  events: Array<{ id: string; title: string; start_time: string }>
}

export function ScheduleSmsDialog({ open, onOpenChange, churchTenantId, events }: ScheduleSmsDialogProps) {
  const [message, setMessage] = useState("")
  const [recipientType, setRecipientType] = useState("all_members")
  const [eventId, setEventId] = useState("")
  const [scheduledFor, setScheduledFor] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    if (!scheduledFor) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/sms/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          message: message.trim(),
          recipientType,
          eventId: eventId || null,
          scheduledFor,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule SMS")
      }

      toast({
        title: "SMS scheduled",
        description: "Your message has been scheduled successfully",
      })

      setMessage("")
      setRecipientType("all_members")
      setEventId("")
      setScheduledFor("")
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule SMS",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule SMS Notification
          </DialogTitle>
          <DialogDescription>Schedule a text message to be sent at a specific time</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-type">Send To</Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger id="recipient-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_members">All Church Members</SelectItem>
                <SelectItem value="event_attendees">Event Attendees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientType === "event_attendees" && (
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger id="event">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {new Date(event.start_time).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="scheduled-for">Schedule For</Label>
            <Input
              id="scheduled-for"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{message.length} characters</span>
              <span>{Math.ceil(message.length / 160) || 1} message(s)</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={saving || !message.trim() || !scheduledFor}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule SMS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
