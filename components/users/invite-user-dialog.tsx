"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  currentUserId: string
}

export function InviteUserDialog({ open, onOpenChange, tenantId, currentUserId }: InviteUserDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInvite = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Sending invitation to:", email)

      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          tenantId,
          invitedBy: currentUserId,
        }),
      })

      const data = await response.json()
      console.log("[v0] Invite API response:", data)

      if (response.status === 409 && data.code === "DUPLICATE_INVITATION") {
        setError(data.error)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation")
      }

      if (data.success === false) {
        throw new Error(data.error || "Failed to send invitation email")
      }

      setSuccess(data.message || "Invitation sent successfully!")
      setEmail("")
      setRole("member")

      setTimeout(() => {
        onOpenChange(false)
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Invite error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>Send an invitation to join your church dashboard</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
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
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={loading || !email}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
