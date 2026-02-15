"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, User, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AddMinistryTeamDialog } from "./add-ministry-team-dialog"
import { EditMinistryTeamDialog } from "./edit-ministry-team-dialog"
import { ManageTeamMembersDialog } from "./manage-team-members-dialog"

interface Member {
  id: string
  full_name: string
}

interface MinistryTeam {
  id: string
  name: string
  description: string | null
  leader: { id: string; full_name: string } | null
  ministry_team_members: Array<{
    id: string
    user: { id: string; full_name: string }
    role: string | null
  }>
}

interface MinistryTeamsProps {
  teams: MinistryTeam[]
  members: Member[]
  onAdd: (team: any) => void
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}

export function MinistryTeams({ teams, members, onAdd, onUpdate, onDelete }: MinistryTeamsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<MinistryTeam | null>(null)
  const [managingTeam, setManagingTeam] = useState<MinistryTeam | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ministry Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No ministry teams yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                    {team.description && <CardDescription className="line-clamp-2">{team.description}</CardDescription>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setManagingTeam(team)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingTeam(team)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.leader && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Leader:</span>
                    <span className="font-medium">{team.leader.full_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{team.ministry_team_members.length} members</span>
                </div>
                {team.ministry_team_members.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {team.ministry_team_members.slice(0, 3).map((member) => (
                      <Badge key={member.id} variant="secondary" className="text-xs">
                        {member.user.full_name}
                      </Badge>
                    ))}
                    {team.ministry_team_members.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{team.ministry_team_members.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddMinistryTeamDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={onAdd} members={members} />

      {editingTeam && (
        <EditMinistryTeamDialog
          open={!!editingTeam}
          onOpenChange={(open) => !open && setEditingTeam(null)}
          team={editingTeam}
          members={members}
          onUpdate={onUpdate}
        />
      )}

      {managingTeam && (
        <ManageTeamMembersDialog
          open={!!managingTeam}
          onOpenChange={(open) => !open && setManagingTeam(null)}
          team={managingTeam}
          members={members}
          type="ministry"
        />
      )}
    </div>
  )
}
