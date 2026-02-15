"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SuperAdminRoleManagerProps {
  member: any
  tenantId: string
}

const ROLES = [
  { value: "lead_admin", label: "Lead Admin", description: "Full administrative access" },
  { value: "admin_staff", label: "Admin Staff", description: "Administrative access" },
  { value: "pastoral_team", label: "Pastoral Team", description: "Pastoral and ministry access" },
  { value: "volunteer_team", label: "Volunteer Team", description: "Volunteer coordination access" },
  { value: "media_team", label: "Media Team", description: "Media assets access only" },
  { value: "member", label: "Member", description: "Basic member access" },
]

export function SuperAdminRoleManager({ member, tenantId }: SuperAdminRoleManagerProps) {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(member.role)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/users/${member.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, tenantId }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      window.location.reload()
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Failed to update role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Shield className="w-4 h-4 mr-2" />
          Change Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>Update the role for {member.users?.full_name || member.users?.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Current Role</Label>
            <div className="mt-2">
              <Badge variant="secondary" className="capitalize">
                {member.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || selectedRole === member.role}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
