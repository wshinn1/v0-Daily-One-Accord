"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Member {
  id: string
  full_name: string
}

interface TeamMember {
  id: string
  user: { id: string; full_name: string }
  role?: string | null
}

interface Team {
  id: string
  name: string
  ministry_team_members?: TeamMember[]
  volunteer_team_members?: TeamMember[]
}

interface ManageTeamMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team
  members: Member[]
  type: "ministry" | "volunteer"
}

export function ManageTeamMembersDialog({ open, onOpenChange, team, members, type }: ManageTeamMembersDialogProps) {
  const [selectedMember, setSelectedMember] = useState("")
  const [memberRole, setMemberRole] = useState("")
  const [teamMembers, setTeamMembers] = useState(
    type === "ministry" ? team.ministry_team_members || [] : team.volunteer_team_members || [],
  )
  const supabase = getSupabaseBrowserClient()

  const tableName = type === "ministry" ? "ministry_team_members" : "volunteer_team_members"
  const teamIdField = type === "ministry" ? "ministry_team_id" : "volunteer_team_id"

  const availableMembers = members.filter((m) => !teamMembers.some((tm) => tm.user.id === m.id))

  const handleAddMember = async () => {
    if (!selectedMember) return

    const insertData: any = {
      [teamIdField]: team.id,
      user_id: selectedMember,
    }

    if (type === "ministry") {
      insertData.role = memberRole || null
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select(`id, user:users(id, full_name)${type === "ministry" ? ", role" : ""}`)
      .single()

    if (!error && data) {
      setTeamMembers([...teamMembers, data as TeamMember])
      setSelectedMember("")
      setMemberRole("")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from(tableName).delete().eq("id", memberId)

    if (!error) {
      setTeamMembers(teamMembers.filter((m) => m.id !== memberId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>{team.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Add Member</Label>
            <div className="flex gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddMember} disabled={!selectedMember}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {type === "ministry" && (
              <Input placeholder="Role (optional)" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} />
            )}
          </div>

          <div className="space-y-2">
            <Label>Current Members ({teamMembers.length})</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.user.full_name}</p>
                      {type === "ministry" && member.role && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {member.role}
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
