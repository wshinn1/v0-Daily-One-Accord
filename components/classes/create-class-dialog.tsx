"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (classData: any) => Promise<{ data: any; error: any }>
  members: any[]
}

export function CreateClassDialog({ open, onOpenChange, onCreate, members }: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    teacher_id: "",
    location: "",
    schedule_day: "",
    schedule_time: "",
    start_date: "",
    end_date: "",
    max_capacity: "",
    age_group: "",
    is_active: true,
    add_to_calendar: true,
    is_recurring: false,
    recurrence_days: [] as string[],
  })
  const [loading, setLoading] = useState(false)

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await onCreate({
        ...formData,
        max_capacity: formData.max_capacity ? Number.parseInt(formData.max_capacity) : null,
        teacher_id: formData.teacher_id || null,
      })

      if (error) throw error

      setFormData({
        name: "",
        description: "",
        category: "",
        teacher_id: "",
        location: "",
        schedule_day: "",
        schedule_time: "",
        start_date: "",
        end_date: "",
        max_capacity: "",
        age_group: "",
        is_active: true,
        add_to_calendar: true,
        is_recurring: false,
        recurrence_days: [],
      })
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Error creating class:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter((d) => d !== day)
        : [...prev.recurrence_days, day],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>Add a new class or program to your church</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunday School">Sunday School</SelectItem>
                  <SelectItem value="Bible Study">Bible Study</SelectItem>
                  <SelectItem value="Youth Group">Youth Group</SelectItem>
                  <SelectItem value="Small Group">Small Group</SelectItem>
                  <SelectItem value="Discipleship">Discipleship</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher/Leader</Label>
              <Select
                value={formData.teacher_id}
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_group">Age Group</Label>
              <Input
                id="age_group"
                value={formData.age_group}
                onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                placeholder="e.g., Adults, Youth, Children"
              />
            </div>

            <div className="col-span-2 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_recurring: checked as boolean, recurrence_days: [] })
                  }
                />
                <label htmlFor="is_recurring" className="text-sm font-medium cursor-pointer">
                  Recurring class (meets on specific days each week)
                </label>
              </div>

              {formData.is_recurring && (
                <div className="pl-6 space-y-2">
                  <Label className="text-sm">Select days of the week:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={formData.recurrence_days.includes(day)}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="schedule_day">Schedule Day</Label>
                <Select
                  value={formData.schedule_day}
                  onValueChange={(value) => setFormData({ ...formData, schedule_day: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="schedule_time">Schedule Time</Label>
              <Input
                id="schedule_time"
                type="time"
                value={formData.schedule_time}
                onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_capacity">Max Capacity</Label>
              <Input
                id="max_capacity"
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <label htmlFor="is_active" className="text-sm cursor-pointer">
                Class is active
              </label>
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox
                id="add_to_calendar"
                checked={formData.add_to_calendar}
                onCheckedChange={(checked) => setFormData({ ...formData, add_to_calendar: checked as boolean })}
              />
              <label htmlFor="add_to_calendar" className="text-sm cursor-pointer">
                Add class to calendar
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
