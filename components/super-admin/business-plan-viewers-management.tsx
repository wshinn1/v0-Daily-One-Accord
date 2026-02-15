"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Eye, FileText, Mail, Key, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Viewer {
  id: string
  email: string
  full_name: string | null
  created_at: string
  last_login_at: string | null
  invitation_sent_at: string | null
  invitation_accepted: boolean
  access_granted: boolean
}

interface BusinessPlanViewersManagementProps {
  viewers: Viewer[]
  userName: string
}

export function BusinessPlanViewersManagement({
  viewers: initialViewers,
  userName,
}: BusinessPlanViewersManagementProps) {
  const [viewers, setViewers] = useState(initialViewers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newFullName, setNewFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const router = useRouter()

  const handleAddViewer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/business-plan/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.toLowerCase().trim(),
          full_name: newFullName.trim() || newEmail.split("@")[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite user")
      }

      // Show generated password
      setGeneratedPassword(data.password)
      setShowPasswordDialog(true)

      // Refresh viewers list
      const refreshResponse = await fetch("/api/business-plan/users")
      const refreshData = await refreshResponse.json()
      setViewers(refreshData.users || [])

      setIsDialogOpen(false)
      setNewEmail("")
      setNewFullName("")
    } catch (err: any) {
      console.error("[v0] Error adding viewer:", err)
      alert(err.message || "Error inviting user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (viewerId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/business-plan/users/${viewerId}/revoke`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to revoke access")
      }

      // Update local state
      setViewers(viewers.map((v) => (v.id === viewerId ? { ...v, access_granted: false } : v)))

      alert("Access revoked successfully!")
    } catch (err) {
      console.error("[v0] Error revoking access:", err)
      alert("Error revoking access. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Plan Access Control</h1>
        <p className="text-muted-foreground">Manage who can view the confidential Daily One Accord business plan</p>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Access Statistics</CardTitle>
            <CardDescription>Overview of business plan access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Invited Users</p>
                <p className="text-3xl font-bold">{viewers.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-lg font-semibold">{viewers.filter((v) => v.access_granted).length} users</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recently Logged In</p>
                <p className="text-lg font-semibold">{viewers.filter((v) => v.last_login_at).length} users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage business plan access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => router.push("/business-plan")}>
              <Eye className="w-4 h-4 mr-2" />
              View Business Plan
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite New User
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invited Users</CardTitle>
              <CardDescription>People who have been invited to access the business plan</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users invited yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Invite your first user to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{viewer.full_name || "No name provided"}</p>
                      {viewer.access_granted ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{viewer.email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Invited {new Date(viewer.created_at).toLocaleDateString()}</span>
                      {viewer.last_login_at && (
                        <span>Last login {new Date(viewer.last_login_at).toLocaleDateString()}</span>
                      )}
                      {!viewer.access_granted && <span className="text-red-600">Access Revoked</span>}
                    </div>
                  </div>
                  {viewer.access_granted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeAccess(viewer.id, viewer.email)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User to Business Plan</DialogTitle>
            <DialogDescription>An auto-generated secure password will be created and sent via email.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddViewer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="investor@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                An email will be sent with login credentials and a secure auto-generated password.
              </AlertDescription>
            </Alert>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Display Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Sent Successfully!</DialogTitle>
            <DialogDescription>
              The user has been invited and an email has been sent with their credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Auto-Generated Password:</p>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">{generatedPassword}</code>
                <p className="text-xs mt-2 text-muted-foreground">
                  This password has been emailed to the user. Save it if needed.
                </p>
              </AlertDescription>
            </Alert>
            <Button onClick={() => setShowPasswordDialog(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
