"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ShieldOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useConfirmation } from "@/hooks/use-confirmation"

interface SuperAdmin {
  id: string
  email: string
  full_name: string
  created_at: string
}

export default function ManageSuperAdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const confirmation = useConfirmation()

  useEffect(() => {
    checkAuth()
    fetchSuperAdmins()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      router.push("/dashboard")
    }
  }

  const fetchSuperAdmins = async () => {
    try {
      const response = await fetch("/api/super-admin/manage-admins")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch super admins")
      }

      setSuperAdmins(data.superAdmins)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAccess = async () => {
    if (!newAdminEmail.trim()) {
      setError("Please enter an email address")
      return
    }

    confirmation.confirm(
      {
        title: "Grant Super Admin Access",
        description: `Are you sure you want to grant super admin access to ${newAdminEmail}? This will give them full control over the system.`,
        confirmText: "Grant Access",
        variant: "default",
      },
      async () => {
        setActionLoading("grant")
        setError("")
        setSuccess("")

        try {
          // Find user by email
          const { data: users } = await supabase.from("users").select("id").eq("email", newAdminEmail.trim()).single()

          if (!users) {
            throw new Error("User not found with that email address")
          }

          const response = await fetch("/api/super-admin/manage-admins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: users.id, action: "grant" }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to grant super admin access")
          }

          setSuccess(data.message)
          setNewAdminEmail("")
          fetchSuperAdmins()
        } catch (err: any) {
          setError(err.message)
        } finally {
          setActionLoading(null)
        }
      },
    )
  }

  const handleRevokeAccess = async (userId: string, email: string) => {
    confirmation.confirm(
      {
        title: "Revoke Super Admin Access",
        description: `Are you sure you want to revoke super admin access from ${email}? They will lose all administrative privileges.`,
        confirmText: "Revoke Access",
        variant: "destructive",
      },
      async () => {
        setActionLoading(userId)
        setError("")
        setSuccess("")

        try {
          const response = await fetch("/api/super-admin/manage-admins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, action: "revoke" }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to revoke super admin access")
          }

          setSuccess(data.message)
          fetchSuperAdmins()
        } catch (err: any) {
          setError(err.message)
        } finally {
          setActionLoading(null)
        }
      },
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/super-admin")}>
          ← Back to Super Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Super Administrators
          </CardTitle>
          <CardDescription>Grant or revoke super admin access to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Grant Super Admin Access</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGrantAccess} disabled={actionLoading === "grant"}>
                    {actionLoading === "grant" ? "Granting..." : "Grant Access"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Current Super Administrators</h3>
              <div className="space-y-2">
                {superAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{admin.full_name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeAccess(admin.id, admin.email)}
                      disabled={actionLoading === admin.id || superAdmins.length === 1}
                    >
                      <ShieldOff className="h-4 w-4 mr-2" />
                      {actionLoading === admin.id ? "Revoking..." : "Revoke"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmation.isOpen}
        onOpenChange={confirmation.setIsOpen}
        title={confirmation.options.title}
        description={confirmation.options.description}
        confirmText={confirmation.options.confirmText}
        cancelText={confirmation.options.cancelText}
        onConfirm={confirmation.handleConfirm}
        variant={confirmation.options.variant}
      />
    </div>
  )
}
