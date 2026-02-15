"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Shield, UsersIcon, Trash2, MoreVertical, Users, Edit, KeyRound } from "lucide-react"
import { InviteUserDialog } from "./invite-user-dialog"
import { BulkInviteDialog } from "./bulk-invite-dialog"
import { EditUserRoleDialog } from "./edit-user-role-dialog"
import { EditUserDialog } from "./edit-user-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuperAdminRoleManager } from "./super-admin-role-manager"
import { SyncUsersButton } from "./sync-users-button"

interface UserManagementProps {
  currentUser: any
  tenantId: string
  members: any[]
  invitations: any[]
}

export function UserManagement({ currentUser, tenantId, members, invitations }: UserManagementProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [bulkInviteDialogOpen, setBulkInviteDialogOpen] = useState(false)
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "lead_admin":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "admin_staff":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "pastoral_team":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "volunteer_team":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "lead_admin":
        return "Lead Admin"
      case "admin_staff":
        return "Admin Staff"
      case "pastoral_team":
        return "Pastoral Team"
      case "volunteer_team":
        return "Volunteer Team"
      case "member":
        return "Member"
      default:
        return role
    }
  }

  const canManageUsers = currentUser.is_super_admin || ["lead_admin", "admin_staff"].includes(currentUser.role)

  const handleEditRole = (member: any) => {
    setSelectedMember(member)
    setEditRoleDialogOpen(true)
  }

  const handleEditUser = (member: any) => {
    setSelectedMember(member)
    setEditUserDialogOpen(true)
  }

  const handleResetPassword = async (member: any) => {
    if (!confirm(`Send password reset email to ${member.users?.email}?`)) return

    try {
      const response = await fetch(`/api/users/${member.users.id}/reset-password`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send password reset")
      }

      alert("Password reset email sent successfully!")
    } catch (error: any) {
      console.error("Error sending password reset:", error)
      alert(error.message || "Failed to send password reset email")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return

    try {
      const response = await fetch(`/api/users/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove user")

      window.location.reload()
    } catch (error) {
      console.error("Error removing user:", error)
      alert("Failed to remove user")
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/users/invitations/${invitationId}/resend`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to resend invitation")

      alert("Invitation resent successfully!")
    } catch (error) {
      console.error("Error resending invitation:", error)
      alert("Failed to resend invitation")
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return

    try {
      const response = await fetch(`/api/users/invitations/${invitationId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to cancel invitation")

      window.location.reload()
    } catch (error) {
      console.error("Error canceling invitation:", error)
      alert("Failed to cancel invitation")
    }
  }

  const filteredMembers = members.filter((member) => {
    // Filter out users with email containing 'slack' or 'bot'
    const email = member.users?.email?.toLowerCase() || ""
    return !email.includes("slack") && !email.includes("bot") && !email.includes("@slack")
  })

  const slackBots = members.filter((member) => {
    const email = member.users?.email?.toLowerCase() || ""
    return email.includes("slack") || email.includes("bot") || email.includes("@slack")
  })

  const canEditUser = (member: any) => {
    if (currentUser.is_super_admin) return true
    if (member.users?.id === currentUser.id) return false
    return canManageUsers
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff and admin users with system access and assigned roles
          </p>
        </div>
        {canManageUsers && (
          <div className="flex items-center gap-2">
            {currentUser.is_super_admin && <SyncUsersButton />}
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
            <Button onClick={() => setBulkInviteDialogOpen(true)} variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Bulk Invite
            </Button>
          </div>
        )}
      </div>

      {!canManageUsers && (
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            You need Lead Admin, Admin Staff, or Super Admin permissions to manage users.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <UsersIcon className="w-4 h-4 mr-2" />
            Active Users ({filteredMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="w-4 h-4 mr-2" />
            Pending Invitations ({invitations.length})
          </TabsTrigger>
          {slackBots.length > 0 && (
            <TabsTrigger value="bots">
              <Shield className="w-4 h-4 mr-2" />
              Slack Bots ({slackBots.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Users with Roles</CardTitle>
              <CardDescription>Staff and administrators with login access to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {member.users?.full_name?.charAt(0) || member.users?.email?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.users?.full_name || "Unknown"}</p>
                          {!member.is_active && <Badge variant="outline">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                        {member.users?.phone && <p className="text-sm text-muted-foreground">{member.users.phone}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(member.role)}>{getRoleLabel(member.role)}</Badge>
                          {member.slack_connected ? (
                            <Badge variant="outline" className="text-xs">
                              Slack Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              No Slack
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {canEditUser(member) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Contact Info
                          </DropdownMenuItem>
                          {currentUser.is_super_admin ? (
                            <div className="p-1">
                              <SuperAdminRoleManager member={member} tenantId={tenantId} />
                            </div>
                          ) : (
                            <DropdownMenuItem onClick={() => handleEditRole(member)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleResetPassword(member)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No members found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Users who have been invited but haven't joined yet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invitation.email}</p>
                          <Badge variant="outline" className="text-xs">
                            Bot Account
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invited by {invitation.invited_by_user?.full_name || "Unknown"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(invitation.role)}>{getRoleLabel(invitation.role)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(canManageUsers || currentUser.is_super_admin) && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleResendInvitation(invitation.id)}>
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {invitations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {slackBots.length > 0 && (
          <TabsContent value="bots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Slack Bots</CardTitle>
                <CardDescription>Automated bot accounts for Slack integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slackBots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{bot.users?.full_name || "Slack Bot"}</p>
                            <Badge variant="outline" className="text-xs">
                              Bot Account
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{bot.users?.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        tenantId={tenantId}
        currentUserId={currentUser.id}
      />

      <BulkInviteDialog
        open={bulkInviteDialogOpen}
        onOpenChange={setBulkInviteDialogOpen}
        tenantId={tenantId}
        currentUserId={currentUser.id}
      />

      {selectedMember && (
        <>
          <EditUserRoleDialog
            open={editRoleDialogOpen}
            onOpenChange={setEditRoleDialogOpen}
            member={selectedMember}
            tenantId={tenantId}
          />
          <EditUserDialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen} member={selectedMember} />
        </>
      )}
    </div>
  )
}
