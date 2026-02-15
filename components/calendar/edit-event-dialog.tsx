"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  leader: { id: string; full_name: string } | null
  max_attendees: number | null
  is_public: boolean
  allow_registration: boolean
}

interface Leader {
  id: string
  full_name: string
}

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event
  leaders: Leader[]
  onUpdate: (id: string, updates: Partial<Event>) => void
}

export function EditEventDialog({ open, onOpenChange, event, leaders, onUpdate }: EditEventDialogProps) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    start_time: event.start_time.slice(0, 16),
    end_time: event.end_time.slice(0, 16),
    location: event.location || "",
    leader_id: event.leader?.id || "",
    max_attendees: event.max_attendees?.toString() || "",
    is_public: event.is_public,
    allow_registration: event.allow_registration,
  })

  useEffect(() => {
    setFormData({
      title: event.title,
      description: event.description || "",
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      location: event.location || "",
      leader_id: event.leader?.id || "",
      max_attendees: event.max_attendees?.toString() || "",
      is_public: event.is_public,
      allow_registration: event.allow_registration,
    })
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(event.id, {
      title: formData.title,
      description: formData.description || null,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location || null,
      leader_id: formData.leader_id || null,
      max_attendees: formData.max_attendees ? Number.parseInt(formData.max_attendees) : null,
      is_public: formData.is_public,
      allow_registration: formData.allow_registration,
    } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update event information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">Event Title *</Label>
            <Input
              id="edit_title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_start_time">Start Time *</Label>
              <Input
                id="edit_start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_time">End Time *</Label>
              <Input
                id="edit_end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_location">Location</Label>
            <Input
              id="edit_location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_leader_id">Event Leader</Label>
            <Select
              value={formData.leader_id}
              onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leader" />
              </SelectTrigger>
              <SelectContent>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_max_attendees">Max Attendees</Label>
            <Input
              id="edit_max_attendees"
              type="number"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit_is_public">Public Event</Label>
            <Switch
              id="edit_is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit_allow_registration">Allow Registration</Label>
            <Switch
              id="edit_allow_registration"
              checked={formData.allow_registration}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_registration: checked })}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
