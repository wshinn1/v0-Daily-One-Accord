"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utils/date-helpers"
import { CalendarIcon, Bell, Trash2, Loader2, Plus, Mail, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardRemindersProps {
  cardId: string
  currentUserId: string
}

export function CardReminders({ cardId, currentUserId }: CardRemindersProps) {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [reminderDate, setReminderDate] = useState<Date>()
  const [reminderTime, setReminderTime] = useState("09:00")
  const [message, setMessage] = useState("")
  const [notifySlack, setNotifySlack] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [quickSelect, setQuickSelect] = useState("")

  useEffect(() => {
    fetchReminders()
  }, [cardId])

  const fetchReminders = async () => {
    try {
      const response = await fetch(`/api/kanban/cards/${cardId}/reminders`)
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSelect = (value: string) => {
    setQuickSelect(value)
    const now = new Date()
    const targetDate = new Date()

    switch (value) {
      case "1day":
        targetDate.setDate(now.getDate() + 1)
        break
      case "2days":
        targetDate.setDate(now.getDate() + 2)
        break
      case "1week":
        targetDate.setDate(now.getDate() + 7)
        break
      case "2weeks":
        targetDate.setDate(now.getDate() + 14)
        break
      case "1month":
        targetDate.setMonth(now.getMonth() + 1)
        break
    }

    setReminderDate(targetDate)
  }

  const handleAddReminder = async () => {
    if (!reminderDate) return

    setSaving(true)
    try {
      const channels = []
      if (notifySlack) channels.push("slack")
      if (notifyEmail) channels.push("email")

      const reminderDateTime = new Date(reminderDate)
      const [hours, minutes] = reminderTime.split(":")
      reminderDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))

      const response = await fetch(`/api/kanban/cards/${cardId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminder_time: reminderDateTime.toISOString(),
          notification_channels: channels,
          message: message || null,
        }),
      })

      if (response.ok) {
        await fetchReminders()
        setShowAddForm(false)
        setReminderDate(undefined)
        setReminderTime("09:00")
        setMessage("")
        setQuickSelect("")
      }
    } catch (error) {
      console.error("[v0] Error creating reminder:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm("Delete this reminder?")) return

    try {
      const response = await fetch(`/api/kanban/cards/${cardId}/reminders/${reminderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchReminders()
      }
    } catch (error) {
      console.error("[v0] Error deleting reminder:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Follow-up Reminders</h3>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <Select value={quickSelect} onValueChange={handleQuickSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a timeframe..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="2days">2 Days (48 hours)</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reminderDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reminderDate ? formatDate(reminderDate) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={reminderDate} onSelect={setReminderDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Message (Optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a custom reminder message..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="slack" checked={notifySlack} onCheckedChange={(checked) => setNotifySlack(!!checked)} />
                <label
                  htmlFor="slack"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Slack Notification
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="email" checked={notifyEmail} onCheckedChange={(checked) => setNotifyEmail(!!checked)} />
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Notification
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddReminder} disabled={!reminderDate || saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Create Reminder
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false)
                setReminderDate(undefined)
                setMessage("")
                setQuickSelect("")
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {reminders.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No reminders set for this card</p>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="border rounded-lg p-3 flex items-start justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{formatDate(new Date(reminder.reminder_time))}</span>
                  <span className="text-xs text-muted-foreground">
                    at{" "}
                    {new Date(reminder.reminder_time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {reminder.is_sent && (
                    <Badge variant="secondary" className="text-xs">
                      Sent
                    </Badge>
                  )}
                </div>
                {reminder.message && <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>}
                <div className="flex gap-1 mt-2">
                  {reminder.notification_channels.includes("slack") && (
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Slack
                    </Badge>
                  )}
                  {reminder.notification_channels.includes("email") && (
                    <Badge variant="outline" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Badge>
                  )}
                </div>
              </div>
              {!reminder.is_sent && (
                <Button onClick={() => handleDeleteReminder(reminder.id)} variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
