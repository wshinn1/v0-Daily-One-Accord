"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditUserRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any
  tenantId: string
}

export function EditUserRoleDialog({ open, onOpenChange, member, tenantId }: EditUserRoleDialogProps) {
  const [role, setRole] = useState(member.role)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUpdate = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/users/${member.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update role")
      }

      alert("Role updated successfully!")
      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>Update the role for {member.users?.full_name || member.users?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="volunteer_team">Volunteer Team</SelectItem>
                <SelectItem value="pastoral_team">Pastoral Team</SelectItem>
                <SelectItem value="admin_staff">Admin Staff</SelectItem>
                <SelectItem value="media_team">Media Team</SelectItem>
                <SelectItem value="lead_admin">Lead Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading || role === member.role}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
