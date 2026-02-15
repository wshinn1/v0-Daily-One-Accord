"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Member {
  id: string
  full_name: string
}

interface VolunteerTeam {
  id: string
  name: string
  description: string | null
  coordinator: { id: string; full_name: string } | null
}

interface EditVolunteerTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: VolunteerTeam
  members: Member[]
  onUpdate: (id: string, updates: any) => void
}

export function EditVolunteerTeamDialog({ open, onOpenChange, team, members, onUpdate }: EditVolunteerTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || "",
    coordinator_id: team.coordinator?.id || "",
  })

  useEffect(() => {
    setFormData({
      name: team.name,
      description: team.description || "",
      coordinator_id: team.coordinator?.id || "",
    })
  }, [team])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(team.id, {
      name: formData.name,
      description: formData.description || null,
      coordinator_id: formData.coordinator_id || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Volunteer Team</DialogTitle>
          <DialogDescription>Update team information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Team Name *</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <div className="space-y-2">
            <Label htmlFor="edit_coordinator_id">Coordinator</Label>
            <Select
              value={formData.coordinator_id}
              onValueChange={(value) => setFormData({ ...formData, coordinator_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coordinator" />
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
          <Button type="submit" className="w-full">
            Update Team
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
