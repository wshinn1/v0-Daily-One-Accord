"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserPlus, Eye, MoreVertical, CheckCircle, XCircle, FileText, Shield, Trash2, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BusinessPlanInviteDialog } from "./business-plan-invite-dialog"
import { useRouter } from "next/navigation"

interface BusinessPlanUser {
  id: string
  email: string
  full_name: string | null
  has_business_plan_access: boolean | null
  business_plan_invited_at: string | null
  business_plan_invited_by: string | null
  created_at: string
  nda_signatures?: Array<{
    id: string
    signed_at: string
    pdf_url: string
    document_version: string
  }>
}

interface BusinessPlanUserManagementProps {
  users: BusinessPlanUser[]
}

export function BusinessPlanUserManagement({ users: initialUsers }: BusinessPlanUserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [ndaFilter, setNdaFilter] = useState<string>("all")
  const router = useRouter()

  const filterUsers = (userList: BusinessPlanUser[]) => {
    return userList.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesNda =
        ndaFilter === "all" ||
        (ndaFilter === "signed" && user.nda_signatures && user.nda_signatures.length > 0) ||
        (ndaFilter === "not-signed" && (!user.nda_signatures || user.nda_signatures.length === 0))

      return matchesSearch && matchesNda
    })
  }

  const handleToggleAccess = async (userId: string, email: string, currentAccess: boolean) => {
    const action = currentAccess ? "revoke" : "grant"
    if (!confirm(`Are you sure you want to ${action} business plan access for ${email}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/super-admin/business-plan-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          hasAccess: !currentAccess,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} access`)
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, has_business_plan_access: !currentAccess } : u)))
      alert(`Access ${currentAccess ? "revoked" : "granted"} successfully!`)
      router.refresh()
    } catch (error) {
      console.error(`Error ${action}ing access:`, error)
      alert(`Failed to ${action} access`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (
      !confirm(
        `⚠️ WARNING: This will permanently delete ${email} from the system.\n\nThis action:\n- Deletes the user from Supabase Auth\n- Removes all their data (NDA signatures, etc.)\n- Cannot be undone\n\nAre you absolutely sure?`,
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/super-admin/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
      }

      setUsers(users.filter((u) => u.id !== userId))
      alert(`User ${email} deleted successfully`)
      router.refresh()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const activeUsers = filterUsers(users.filter((u) => u.has_business_plan_access === true))
  const noAccessUsers = filterUsers(users.filter((u) => !u.has_business_plan_access))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Plan Access</h1>
          <p className="text-muted-foreground mt-1">
            Manage users who can view the confidential Daily One Accord business plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/business-plan")}>
            <Eye className="w-4 h-4 mr-2" />
            View Business Plan
          </Button>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.has_business_plan_access === true).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={ndaFilter} onValueChange={setNdaFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by NDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="signed">NDA Signed</SelectItem>
                <SelectItem value="not-signed">NDA Not Signed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            <CheckCircle className="w-4 h-4 mr-2" />
            Has Access ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="no-access">
            <XCircle className="w-4 h-4 mr-2" />
            No Access ({noAccessUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users with Business Plan Access</CardTitle>
              <CardDescription>Users who can currently view the business plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-700">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.full_name || "No name provided"}</p>
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.business_plan_invited_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Granted {new Date(user.business_plan_invited_at).toLocaleDateString()}
                          </p>
                        )}
                        {user.nda_signatures && user.nda_signatures.length > 0 ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700">
                              <FileText className="w-3 h-3 mr-1" />
                              NDA Signed
                            </Badge>
                            <a
                              href={user.nda_signatures[0].pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View PDF
                            </a>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user.nda_signatures[0].signed_at).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 mt-1">
                            NDA Not Signed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={loading}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleAccess(user.id, user.email, true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Revoke Access
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {activeUsers.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || ndaFilter !== "all" ? "No users match your filters" : "No users with access"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm || ndaFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Grant access to users or invite new ones to view the business plan"}
                    </p>
                    {!searchTerm && ndaFilter === "all" && (
                      <Button onClick={() => setInviteDialogOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite User
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="no-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users Without Access</CardTitle>
              <CardDescription>Grant business plan access to existing users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {noAccessUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name || "No name provided"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAccess(user.id, user.email, false)}
                        disabled={loading}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Grant Access
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={loading}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {noAccessUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || ndaFilter !== "all"
                      ? "No users match your filters"
                      : "All users have business plan access"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BusinessPlanInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}
