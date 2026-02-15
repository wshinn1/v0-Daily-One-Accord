"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Mail, MessageSquare, MoreVertical, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

interface Group {
  id: string
  name: string
  description: string | null
  group_type: string
  member_group_assignments?: { count: number }[]
}

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

export function GroupsManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [availableMembers, setAvailableMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    group_type: "ministry",
  })

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/members/groups")
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/members/groups/${groupId}/available-members`)
      const data = await response.json()
      setAvailableMembers(data.members || [])
    } catch (error) {
      console.error("Error fetching available members:", error)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/members/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewGroup({ name: "", description: "", group_type: "ministry" })
        fetchGroups()
      }
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      const response = await fetch(`/api/members/groups/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGroups()
      }
    } catch (error) {
      console.error("Error deleting group:", error)
    }
  }

  const handleAddMembers = async () => {
    if (!selectedGroup || selectedMembers.length === 0) return

    try {
      const response = await fetch(`/api/members/groups/${selectedGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: selectedMembers }),
      })

      if (response.ok) {
        setIsAddMembersDialogOpen(false)
        setSelectedMembers([])
        fetchGroups()
      }
    } catch (error) {
      console.error("Error adding members:", error)
    }
  }

  const handleSendNotification = (group: Group, type: "email" | "sms") => {
    // Navigate to notification page with group filter
    window.location.href = `/dashboard/${type === "email" ? "newsletter" : "sms"}?groupId=${group.id}`
  }

  const getMemberCount = (group: Group) => {
    return group.member_group_assignments?.[0]?.count || 0
  }

  if (loading) {
    return <div className="text-center py-8">Loading groups...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Create groups to organize members and send targeted email/SMS notifications
        </p>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Youth Ministry, Worship Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Group Type</Label>
                <Select
                  value={newGroup.group_type}
                  onValueChange={(value) => setNewGroup({ ...newGroup, group_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ministry">Ministry</SelectItem>
                    <SelectItem value="small_group">Small Group</SelectItem>
                    <SelectItem value="volunteer">Volunteer Team</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Brief description of the group"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Group</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No groups yet. Create your first group to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {group.group_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGroup(group)
                          fetchAvailableMembers(group.id)
                          setIsAddMembersDialogOpen(true)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendNotification(group, "email")}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendNotification(group, "sms")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)} className="text-destructive">
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {group.description && (
                  <CardDescription className="mb-4 line-clamp-2">{group.description}</CardDescription>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{getMemberCount(group)} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">All members are already in this group</p>
            ) : (
              <>
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, member.id])
                          } else {
                            setSelectedMembers(selectedMembers.filter((id) => id !== member.id))
                          }
                        }}
                      />
                      <label htmlFor={member.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                        {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddMembersDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
                    Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
