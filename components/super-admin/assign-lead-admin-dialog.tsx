"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { UserCircle, Loader2 } from "lucide-react"

interface AssignLeadAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchId: string
  churchName: string
  currentLeadAdminId?: string
  onLeadAdminAssigned: (userId: string, userName: string) => void
}

interface ChurchMember {
  id: string
  user_id: string
  role: string
  users: {
    id: string
    full_name: string
    email: string
  }
}

export function AssignLeadAdminDialog({
  open,
  onOpenChange,
  churchId,
  churchName,
  currentLeadAdminId,
  onLeadAdminAssigned,
}: AssignLeadAdminDialogProps) {
  const [members, setMembers] = useState<ChurchMember[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>(currentLeadAdminId || "")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open, churchId])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("church_members")
        .select(`
          id,
          user_id,
          role,
          users:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq("church_tenant_id", churchId)
        .eq("is_active", true)
        .order("role")

      if (error) throw error

      setMembers(data || [])
    } catch (err) {
      console.error("[v0] Error loading members:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedUserId) return

    setSaving(true)
    try {
      // Update church tenant with new lead admin
      const { error: updateError } = await supabase
        .from("church_tenants")
        .update({ lead_admin_id: selectedUserId })
        .eq("id", churchId)

      if (updateError) throw updateError

      // Update the user's role to lead_admin if not already
      const { error: roleError } = await supabase
        .from("church_members")
        .update({ role: "lead_admin" })
        .eq("church_tenant_id", churchId)
        .eq("user_id", selectedUserId)

      if (roleError) throw roleError

      const selectedMember = members.find((m) => m.user_id === selectedUserId)
      const userName = selectedMember?.users?.full_name || selectedMember?.users?.email || "Unknown"

      onLeadAdminAssigned(selectedUserId, userName)
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Error assigning lead admin:", err)
      alert("Failed to assign lead admin. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Lead Admin</DialogTitle>
          <DialogDescription>Select a member to be the lead admin for {churchName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="lead-admin">Select Lead Admin</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="lead-admin">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{member.users?.full_name || member.users?.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Current role: {member.role.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members found. Invite users first before assigning a lead admin.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Lead Admin"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
