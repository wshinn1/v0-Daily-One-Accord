"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Visitor {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  notes: string | null
  first_visit_date: string | null
  assigned_to: { id: string; full_name: string } | null
  due_date: string | null
}

interface StaffMember {
  id: string
  full_name: string
}

interface EditVisitorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitor: Visitor
  staffMembers: StaffMember[]
  onUpdate: (id: string, updates: Partial<Visitor>) => void
}

export function EditVisitorDialog({ open, onOpenChange, visitor, staffMembers, onUpdate }: EditVisitorDialogProps) {
  const [formData, setFormData] = useState({
    full_name: visitor.full_name,
    email: visitor.email || "",
    phone: visitor.phone || "",
    first_visit_date: visitor.first_visit_date || "",
    assigned_to: visitor.assigned_to?.id || null,
    notes: visitor.notes || "",
    due_date: visitor.due_date || "",
  })

  useEffect(() => {
    setFormData({
      full_name: visitor.full_name,
      email: visitor.email || "",
      phone: visitor.phone || "",
      first_visit_date: visitor.first_visit_date || "",
      assigned_to: visitor.assigned_to?.id || null,
      notes: visitor.notes || "",
      due_date: visitor.due_date || "",
    })
  }, [visitor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(visitor.id, {
      ...formData,
      assigned_to: formData.assigned_to || null,
    } as any)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Visitor</DialogTitle>
          <DialogDescription>Update visitor information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">Full Name *</Label>
            <Input
              id="edit_full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_phone">Phone</Label>
            <Input
              id="edit_phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_first_visit_date">First Visit Date</Label>
            <Input
              id="edit_first_visit_date"
              type="date"
              value={formData.first_visit_date}
              onChange={(e) => setFormData({ ...formData, first_visit_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_due_date">Follow-up Due Date</Label>
            <Input
              id="edit_due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Set a reminder for when to follow up with this visitor</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_assigned_to">Assign To (Optional)</Label>
            <Select
              value={formData.assigned_to}
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None (Unassigned)</SelectItem>
                {staffMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_notes">Quick Notes</Label>
            <Textarea
              id="edit_notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add a quick note about this visitor..."
            />
            <p className="text-xs text-muted-foreground">
              For detailed discussions, use the Comments tab in the visitor detail view
            </p>
          </div>
          <Button type="submit" className="w-full">
            Update Visitor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
