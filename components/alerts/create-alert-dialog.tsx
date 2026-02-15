"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/utils/date-helpers"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateAlertDialog({ isOpen, onClose, onSuccess }: CreateAlertDialogProps) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [channelId, setChannelId] = useState("")
  const [scheduleType, setScheduleType] = useState("daily")
  const [scheduleTime, setScheduleTime] = useState("09:00")
  const [scheduleDate, setScheduleDate] = useState<Date>()
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("1")
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState("1")
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchChannels()
    }
  }, [isOpen])

  const fetchChannels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/slack/channels")
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching channels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!name || !message || !channelId) return

    setSaving(true)
    try {
      const payload: any = {
        name,
        message,
        channel_id: channelId,
        schedule_type: scheduleType,
        schedule_time: scheduleTime,
      }

      if (scheduleType === "once" && scheduleDate) {
        const [hours, minutes] = scheduleTime.split(":")
        const nextRun = new Date(scheduleDate)
        nextRun.setHours(Number.parseInt(hours), Number.parseInt(minutes))
        payload.next_run_at = nextRun.toISOString()
      } else if (scheduleType === "weekly") {
        payload.schedule_day_of_week = Number.parseInt(scheduleDayOfWeek)
      } else if (scheduleType === "monthly") {
        payload.schedule_day_of_month = Number.parseInt(scheduleDayOfMonth)
      }

      const response = await fetch("/api/scheduled-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("[v0] Error creating alert:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Scheduled Alert</DialogTitle>
          <DialogDescription>Set up an automated Slack notification for your team</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Alert Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Team Standup Reminder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message to send..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Slack Channel</Label>
            <Select value={channelId} onValueChange={setChannelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a channel..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">Loading channels...</div>
                ) : (
                  channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Schedule Type</Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </div>
          </div>

          {scheduleType === "once" && (
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? formatDate(scheduleDate) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {scheduleType === "weekly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select value={scheduleDayOfWeek} onValueChange={setScheduleDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {scheduleType === "monthly" && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Select value={scheduleDayOfMonth} onValueChange={setScheduleDayOfMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={saving || !name || !message || !channelId} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Alert
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
