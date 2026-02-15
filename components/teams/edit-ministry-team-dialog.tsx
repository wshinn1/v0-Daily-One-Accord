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

interface MinistryTeam {
  id: string
  name: string
  description: string | null
  leader: { id: string; full_name: string } | null
}

interface EditMinistryTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: MinistryTeam
  members: Member[]
  onUpdate: (id: string, updates: any) => void
}

export function EditMinistryTeamDialog({ open, onOpenChange, team, members, onUpdate }: EditMinistryTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || "",
    leader_id: team.leader?.id || "",
  })

  useEffect(() => {
    setFormData({
      name: team.name,
      description: team.description || "",
      leader_id: team.leader?.id || "",
    })
  }, [team])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(team.id, {
      name: formData.name,
      description: formData.description || null,
      leader_id: formData.leader_id || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ministry Team</DialogTitle>
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
            <Label htmlFor="edit_leader_id">Team Leader</Label>
            <Select
              value={formData.leader_id}
              onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leader" />
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
