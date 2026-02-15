"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateRundownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchTenantId: string
  churchMembers: any[]
  onRundownCreated: (rundown: any) => void
}

export function CreateRundownDialog({
  open,
  onOpenChange,
  churchTenantId,
  churchMembers,
  onRundownCreated,
}: CreateRundownDialogProps) {
  const [title, setTitle] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventType, setEventType] = useState("church_service")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("10:00")
  const [loading, setLoading] = useState(false)
  const [teamCategories, setTeamCategories] = useState<any[]>([])
  const [teamAssignments, setTeamAssignments] = useState<Array<{ category_id: string; user_id: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMember, setSelectedMember] = useState("")
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (open) {
      fetchTeamCategories()
    }
  }, [open])

  const fetchTeamCategories = async () => {
    const { data } = await supabase
      .from("service_team_categories")
      .select("id, name")
      .eq("church_tenant_id", churchTenantId)
      .eq("is_active", true)
      .order("order_index")

    setTeamCategories(data || [])
  }

  const handleAddTeamAssignment = () => {
    if (!selectedCategory || !selectedMember) return

    // Check if this combination already exists
    const exists = teamAssignments.some((a) => a.category_id === selectedCategory && a.user_id === selectedMember)

    if (!exists) {
      setTeamAssignments([...teamAssignments, { category_id: selectedCategory, user_id: selectedMember }])
      setSelectedCategory("")
      setSelectedMember("")
    }
  }

  const handleRemoveTeamAssignment = (index: number) => {
    setTeamAssignments(teamAssignments.filter((_, i) => i !== index))
  }

  const getCategoryName = (categoryId: string) => {
    return teamCategories.find((c) => c.id === categoryId)?.name || "Unknown"
  }

  const getMemberName = (memberId: string) => {
    return churchMembers.find((m) => m.id === memberId)?.full_name || "Unknown"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("event_rundowns")
        .insert({
          church_tenant_id: churchTenantId,
          title,
          event_date: eventDate,
          event_type: eventType,
          description,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error

      if (teamAssignments.length > 0) {
        const assignmentsToInsert = teamAssignments.map((assignment) => ({
          rundown_id: data.id,
          category_id: assignment.category_id,
          user_id: assignment.user_id,
        }))

        const { error: assignmentError } = await supabase.from("rundown_team_assignments").insert(assignmentsToInsert)

        if (assignmentError) {
          console.error("[v0] Error creating team assignments:", assignmentError)
        }
      }

      try {
        const startDateTime = new Date(`${eventDate}T${startTime}:00`)
        const endDateTime = new Date(startDateTime)
        endDateTime.setHours(endDateTime.getHours() + 2) // Default 2 hour duration

        const { data: calendarEvent, error: calendarError } = await supabase
          .from("events")
          .insert({
            church_tenant_id: churchTenantId,
            title: title,
            description: description || `Event rundown: ${title}`,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            is_public: false,
            allow_registration: false,
          })
          .select()
          .single()

        if (!calendarError && calendarEvent) {
          // Update rundown with calendar event reference
          await supabase
            .from("event_rundowns")
            .update({
              added_to_calendar: true,
              calendar_event_id: calendarEvent.id,
            })
            .eq("id", data.id)
        }
      } catch (calendarError) {
        console.error("[v0] Failed to add rundown to calendar:", calendarError)
        // Don't fail the whole operation if calendar creation fails
      }

      toast({
        title: "Rundown created",
        description: "Your event rundown has been created and added to the calendar.",
      })

      onRundownCreated(data)
      setTitle("")
      setEventDate("")
      setEventType("church_service")
      setDescription("")
      setStartTime("10:00")
      setTeamAssignments([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Event Rundown</DialogTitle>
            <DialogDescription>Create a new rundown for your church service or event</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunday Service - December 15"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="church_service">Church Service</SelectItem>
                  <SelectItem value="bible_study">Bible Study</SelectItem>
                  <SelectItem value="prayer_meeting">Prayer Meeting</SelectItem>
                  <SelectItem value="youth_group">Youth Group</SelectItem>
                  <SelectItem value="special_event">Special Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details about this event..."
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Assignments (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Display current assignments */}
                {teamAssignments.length > 0 && (
                  <div className="space-y-2">
                    {teamAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">
                          <span className="font-medium">{getCategoryName(assignment.category_id)}:</span>{" "}
                          {getMemberName(assignment.user_id)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeamAssignment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new assignment */}
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select person..." />
                    </SelectTrigger>
                    <SelectContent>
                      {churchMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddTeamAssignment}
                    disabled={!selectedCategory || !selectedMember}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Rundown"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
