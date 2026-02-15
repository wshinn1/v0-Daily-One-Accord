"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Plus, Minus, Calendar } from "lucide-react"

interface Event {
  id: string
  title: string
  start_time: string
}

interface Category {
  id: string
  name: string
  description: string | null
}

interface AddCategoryAttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: () => void
  events: Event[]
  categories: Category[]
  churchTenantId: string
}

export function AddCategoryAttendanceDialog({
  open,
  onOpenChange,
  onAdd,
  events,
  categories,
  churchTenantId,
}: AddCategoryAttendanceDialogProps) {
  const [eventId, setEventId] = useState("")
  const [notes, setNotes] = useState("")
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) return

    setIsSubmitting(true)

    try {
      const records = Object.entries(categoryCounts)
        .filter(([_, count]) => count > 0)
        .map(([categoryId, count]) => ({
          church_tenant_id: churchTenantId,
          event_id: eventId,
          category_id: categoryId,
          count,
          notes: notes || null,
          recorded_at: new Date(attendanceDate).toISOString(),
        }))

      if (records.length > 0) {
        const { error } = await supabase.from("attendance_by_category").insert(records)

        if (error) {
          console.error("[v0] Error adding category attendance:", error)
          alert("Failed to add attendance. Please try again.")
        } else {
          onAdd()
          setEventId("")
          setNotes("")
          setAttendanceDate(new Date().toISOString().split("T")[0])
          setCategoryCounts(categories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}))
          onOpenChange(false)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateCount = (categoryId: string, delta: number) => {
    setCategoryCounts((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, (prev[categoryId] || 0) + delta),
    }))
  }

  const setCount = (categoryId: string, value: string) => {
    const num = Number.parseInt(value) || 0
    setCategoryCounts((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, num),
    }))
  }

  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Attendance by Category</DialogTitle>
          <DialogDescription>Enter attendance counts for different groups</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event_id">Event *</Label>
            <Select value={eventId} onValueChange={setEventId}>
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
            <Label htmlFor="attendance_date">Attendance Date *</Label>
            <div className="relative">
              <Input
                id="attendance_date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Attendance Counts</Label>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  {category.description && <div className="text-sm text-muted-foreground">{category.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => updateCount(category.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={categoryCounts[category.id] || 0}
                    onChange={(e) => setCount(category.id, e.target.value)}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => updateCount(category.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-semibold">Total Attendance</span>
            <span className="text-2xl font-bold">{totalCount}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!eventId || totalCount === 0 || isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Attendance"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
