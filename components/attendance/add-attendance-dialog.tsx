"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Event {
  id: string
  title: string
  start_time: string
}

interface Member {
  id: string
  full_name: string
}

interface AddAttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (attendance: any) => void
  events: Event[]
  members: Member[]
}

export function AddAttendanceDialog({ open, onOpenChange, onAdd, events, members }: AddAttendanceDialogProps) {
  const [formData, setFormData] = useState({
    event_id: "",
    user_id: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      event_id: formData.event_id,
      user_id: formData.user_id,
      notes: formData.notes || null,
    })
    setFormData({
      event_id: "",
      user_id: "",
      notes: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>Add an attendance record for an event</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_id">Event *</Label>
            <Select value={formData.event_id} onValueChange={(value) => setFormData({ ...formData, event_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
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
          <div className="space-y-2">
            <Label htmlFor="user_id">Member *</Label>
            <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!formData.event_id || !formData.user_id}>
            Record Attendance
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
