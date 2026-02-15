"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Trash2, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TimeEntry {
  id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  description: string
  activity_type: string
  user: {
    id: string
    full_name: string
  }
}

interface VisitorTimeTrackingProps {
  visitorId: string
  currentUserId: string
}

export function VisitorTimeTracking({ visitorId, currentUserId }: VisitorTimeTrackingProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    started_at: "",
    ended_at: "",
    description: "",
    activity_type: "phone_call",
  })

  useEffect(() => {
    loadTimeEntries()
  }, [visitorId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking && trackingStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000)
        setElapsedSeconds(diff)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking, trackingStartTime])

  const loadTimeEntries = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/time-entries`)
      const data = await response.json()

      if (response.ok) {
        setTimeEntries(data.timeEntries || [])
      }
    } catch (error) {
      console.error("[v0] Error loading time entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startTracking = () => {
    setIsTracking(true)
    setTrackingStartTime(new Date())
    setElapsedSeconds(0)
  }

  const stopTracking = () => {
    if (!trackingStartTime) return

    const now = new Date()
    setFormData({
      ...formData,
      started_at: trackingStartTime.toISOString(),
      ended_at: now.toISOString(),
    })
    setIsTracking(false)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitorId}/time-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save time entry")

      toast({ title: "Success", description: "Time entry logged successfully" })
      setIsDialogOpen(false)
      resetForm()
      loadTimeEntries()
    } catch (error) {
      console.error("[v0] Error saving time entry:", error)
      toast({ title: "Error", description: "Failed to save time entry", variant: "destructive" })
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return

    try {
      const response = await fetch(`/api/visitors/${visitorId}/time-entries/${entryId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete time entry")

      toast({ title: "Success", description: "Time entry deleted" })
      loadTimeEntries()
    } catch (error) {
      console.error("[v0] Error deleting time entry:", error)
      toast({ title: "Error", description: "Failed to delete time entry", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      started_at: "",
      ended_at: "",
      description: "",
      activity_type: "phone_call",
    })
    setTrackingStartTime(null)
    setElapsedSeconds(0)
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      phone_call: "Phone Call",
      meeting: "Meeting",
      email: "Email",
      visit: "Visit",
      other: "Other",
    }
    return labels[type] || type
  }

  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading time entries...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Total Time: {formatDuration(totalMinutes)}</span>
        </div>
        <div className="flex gap-2">
          {isTracking ? (
            <Button onClick={stopTracking} variant="destructive" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop ({formatElapsedTime(elapsedSeconds)})
            </Button>
          ) : (
            <Button onClick={startTracking} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
                <DialogDescription>Record time spent on this visitor follow-up</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="started_at">Start Time</Label>
                    <Input
                      id="started_at"
                      type="datetime-local"
                      value={formData.started_at ? new Date(formData.started_at).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setFormData({ ...formData, started_at: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ended_at">End Time</Label>
                    <Input
                      id="ended_at"
                      type="datetime-local"
                      value={formData.ended_at ? new Date(formData.ended_at).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setFormData({ ...formData, ended_at: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Select
                    value={formData.activity_type}
                    onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                  >
                    <SelectTrigger id="activity_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What did you work on?"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Save Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {timeEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No time entries yet. Start tracking your work!
          </p>
        ) : (
          timeEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{getActivityLabel(entry.activity_type)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.started_at).toLocaleDateString()} at{" "}
                    {new Date(entry.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs font-medium text-blue-600">{formatDuration(entry.duration_minutes)}</span>
                </div>
                {entry.description && <p className="text-sm text-muted-foreground">{entry.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">by {entry.user.full_name}</p>
              </div>
              {entry.user.id === currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
