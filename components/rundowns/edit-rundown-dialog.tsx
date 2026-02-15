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
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditRundownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rundown: any
  onRundownUpdated: (rundown: any) => void
}

export function EditRundownDialog({ open, onOpenChange, rundown, onRundownUpdated }: EditRundownDialogProps) {
  const [title, setTitle] = useState(rundown.title)
  const [description, setDescription] = useState(rundown.description || "")
  const [eventDate, setEventDate] = useState(rundown.event_date)
  const [loading, setLoading] = useState(false)
  const [teamCategories, setTeamCategories] = useState<any[]>([])
  const [churchMembers, setChurchMembers] = useState<any[]>([])
  const [teamAssignments, setTeamAssignments] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMember, setSelectedMember] = useState("")
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (open) {
      fetchTeamData()
    }
  }, [open, rundown.id])

  const fetchTeamData = async () => {
    // Fetch categories
    const { data: categories } = await supabase
      .from("service_team_categories")
      .select("id, name")
      .eq("church_tenant_id", rundown.church_tenant_id)
      .eq("is_active", true)
      .order("order_index")

    setTeamCategories(categories || [])

    // Fetch church members
    const { data: members } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("church_tenant_id", rundown.church_tenant_id)
      .order("full_name")

    setChurchMembers(members || [])

    // Fetch existing assignments
    const { data: assignments } = await supabase
      .from("rundown_team_assignments")
      .select(`
        id,
        category_id,
        user_id,
        service_team_categories(name),
        users(full_name)
      `)
      .eq("rundown_id", rundown.id)

    if (assignments) {
      const formatted = assignments.map((a: any) => ({
        id: a.id,
        category_id: a.category_id,
        user_id: a.user_id,
        category_name: a.service_team_categories?.name || "",
        user_name: a.users?.full_name || "",
      }))
      setTeamAssignments(formatted)
    }
  }

  const handleAddTeamAssignment = async () => {
    if (!selectedCategory || !selectedMember) return

    try {
      const { data, error } = await supabase
        .from("rundown_team_assignments")
        .insert({
          rundown_id: rundown.id,
          category_id: selectedCategory,
          user_id: selectedMember,
        })
        .select(`
          id,
          category_id,
          user_id,
          service_team_categories(name),
          users(full_name)
        `)
        .single()

      if (error) throw error

      const formatted = {
        id: data.id,
        category_id: data.category_id,
        user_id: data.user_id,
        category_name: (data as any).service_team_categories?.name || "",
        user_name: (data as any).users?.full_name || "",
      }

      setTeamAssignments([...teamAssignments, formatted])
      setSelectedCategory("")
      setSelectedMember("")

      toast({
        title: "Team member added",
        description: "Team assignment has been added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveTeamAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from("rundown_team_assignments").delete().eq("id", assignmentId)

      if (error) throw error

      setTeamAssignments(teamAssignments.filter((a) => a.id !== assignmentId))

      toast({
        title: "Team member removed",
        description: "Team assignment has been removed.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !eventDate) {
      toast({
        title: "Missing information",
        description: "Please provide a title and event date.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("event_rundowns")
        .update({
          title,
          description,
          event_date: eventDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rundown.id)
        .select()
        .single()

      if (error) throw error

      // If rundown is linked to a calendar event, update that too
      if (rundown.calendar_event_id) {
        await fetch("/api/rundowns/update-calendar-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rundownId: rundown.id,
            calendarEventId: rundown.calendar_event_id,
          }),
        })
      }

      toast({
        title: "Rundown updated",
        description: "The rundown has been updated successfully.",
      })

      onRundownUpdated(data)
      onOpenChange(false)
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
            <DialogTitle>Edit Rundown</DialogTitle>
            <DialogDescription>Update the details of your event rundown</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title *</Label>
              <Input
                id="edit-title"
                placeholder="Sunday Service, Youth Night, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-date">Event Date *</Label>
              <Input
                id="edit-event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Add any notes or details about this event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Display current assignments */}
                {teamAssignments.length > 0 && (
                  <div className="space-y-2">
                    {teamAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm">
                          <span className="font-medium">{assignment.category_name}:</span> {assignment.user_name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeamAssignment(assignment.id)}
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
              {loading ? "Updating..." : "Update Rundown"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
