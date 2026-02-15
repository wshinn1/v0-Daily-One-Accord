"use client"

import { AlertDescription as AlertDescriptionComponent } from "@/components/ui/alert"
import { FileText, CreditCard, Download, LifeBuoy, TrendingUp, BarChart3, Flag, Shield, Search } from "lucide-react"
import { ChurchSetupWizard } from "./church-setup-wizard"
import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Building2,
  Plus,
  ExternalLink,
  LogOut,
  Palette,
  Key,
  UserCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import { ChurchThemeEditorDialog } from "./church-theme-editor-dialog"
import { ChurchCodeDisplay } from "./church-code-display"
import { AssignLeadAdminDialog } from "./assign-lead-admin-dialog"
import { ConfigureSlackChatDialog } from "./configure-slack-chat-dialog"
import { SlackBotSetup } from "@/components/slack/slack-bot-setup"
import { BlogManagement } from "./blog-management"

interface Tenant {
  id: string
  name: string
  slug: string
  created_at: string
  church_code?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  heading_font?: string
  body_font?: string
  font_size_base?: string
  font_size_heading?: string
  lead_admin_id?: string
  lead_admin_name?: string
  slack_workspace_url?: string
  rundown_channel_name?: string
  google_drive_url?: string
}

interface SuperAdmin {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

interface SuperAdminDashboardProps {
  tenants: Tenant[]
  superAdmins: SuperAdmin[]
  userName: string
}

export function SuperAdminDashboard({
  tenants: initialTenants,
  superAdmins: initialSuperAdmins,
  userName,
}: SuperAdminDashboardProps) {
  const [tenants, setTenants] = useState(initialTenants)
  const [superAdmins, setSuperAdmins] = useState(initialSuperAdmins)
  const [activeTab, setActiveTab] = useState<"churches" | "admins" | "blog">("churches")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSuperAdminDialogOpen, setIsSuperAdminDialogOpen] = useState(false)
  const [editingSuperAdmin, setEditingSuperAdmin] = useState<SuperAdmin | null>(null)
  const [superAdminEmail, setSuperAdminEmail] = useState("")
  const [superAdminFullName, setSuperAdminFullName] = useState("")
  const [themeEditorOpen, setThemeEditorOpen] = useState(false)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [leadAdminDialogOpen, setLeadAdminDialogOpen] = useState(false)
  const [slackUrlDialogOpen, setSlackUrlDialogOpen] = useState(false)
  const [rundownChannelDialogOpen, setRundownChannelDialogOpen] = useState(false)
  const [googleDriveDialogOpen, setGoogleDriveDialogOpen] = useState(false)
  const [googleDriveApiDialogOpen, setGoogleDriveApiDialogOpen] = useState(false)
  const [googleDriveApiKey, setGoogleDriveApiKey] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [newTenantName, setNewTenantName] = useState("")
  const [newTenantSlug, setNewTenantSlug] = useState("")
  const [slackWorkspaceUrl, setSlackWorkspaceUrl] = useState("")
  const [rundownChannelName, setRundownChannelName] = useState("")
  const [googleDriveUrl, setGoogleDriveUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [stripeChatDialogOpen, setStripeChatDialogOpen] = useState(false)
  const [stripeBotConfigDialogOpen, setStripeBotConfigDialogOpen] = useState(false)
  const [setupWizardOpen, setSetupWizardOpen] = useState(false)
  const [setupWizardChurch, setSetupWizardChurch] = useState<Tenant | null>(null)
  const [stripeConfigDialogOpen, setStripeConfigDialogOpen] = useState(false)
  const [stripePricingDialogOpen, setStripePricingDialogOpen] = useState(false)
  const [stripePricingLoading, setStripePricingLoading] = useState(false)
  const [stripePriceIds, setStripePriceIds] = useState<{ growthPriceId: string; socialMediaPriceId: string } | null>(
    null,
  )

  const dashboardNavigationItems = [
    {
      name: "Subscriptions",
      href: "/super-admin/subscriptions",
      icon: CreditCard,
      description: "Manage subscriptions & billing",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      name: "Analytics",
      href: "/super-admin/analytics",
      icon: TrendingUp,
      description: "View growth & revenue metrics",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      name: "Support Tickets",
      href: "/super-admin/support-tickets",
      icon: LifeBuoy,
      description: "Manage customer support",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      name: "Onboarding",
      href: "/super-admin/onboarding",
      icon: BarChart3,
      description: "Track setup completion",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      name: "Feature Flags",
      href: "/super-admin/feature-flags",
      icon: Flag,
      description: "Control feature availability",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      name: "Audit Logs",
      href: "/super-admin/audit-logs",
      icon: Shield,
      description: "Security & activity monitoring",
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      name: "SEO Settings",
      href: "/super-admin/seo",
      icon: Search,
      description: "Manage site-wide SEO",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
  ]

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("church_tenants")
        .insert({
          name: newTenantName,
          slug: newTenantSlug,
        })
        .select()
        .single()

      if (error) throw error

      setTenants([data, ...tenants])
      setIsDialogOpen(false)
      setNewTenantName("")
      setNewTenantSlug("")
    } catch (err) {
      console.error("[v0] Error creating tenant:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleViewTenant = (tenantId: string) => {
    router.push(`/dashboard?tenant=${tenantId}`)
  }

  const handleEditTheme = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setThemeEditorOpen(true)
  }

  const handleViewCode = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setCodeDialogOpen(true)
  }

  const handleCodeUpdated = (tenantId: string, newCode: string) => {
    setTenants(tenants.map((t) => (t.id === tenantId ? { ...t, church_code: newCode } : t)))
  }

  const handleAssignLeadAdmin = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setLeadAdminDialogOpen(true)
  }

  const handleLeadAdminAssigned = (userId: string, userName: string) => {
    if (selectedTenant) {
      setTenants(
        tenants.map((t) =>
          t.id === selectedTenant.id ? { ...t, lead_admin_id: userId, lead_admin_name: userName } : t,
        ),
      )
    }
  }

  const handleEditSlackUrl = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setSlackWorkspaceUrl(tenant.slack_workspace_url || "")
    setSlackUrlDialogOpen(true)
  }

  const handleSaveSlackUrl = async () => {
    if (!selectedTenant) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ slack_workspace_url: slackWorkspaceUrl || null })
        .eq("id", selectedTenant.id)

      if (error) throw error

      setTenants(
        tenants.map((t) => (t.id === selectedTenant.id ? { ...t, slack_workspace_url: slackWorkspaceUrl } : t)),
      )
      setSlackUrlDialogOpen(false)
    } catch (err) {
      console.error("[v0] Error updating Slack workspace URL:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRundownChannel = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setRundownChannelName(tenant.rundown_channel_name || "event-rundowns")
    setRundownChannelDialogOpen(true)
  }

  const handleSaveRundownChannel = async () => {
    if (!selectedTenant) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ rundown_channel_name: rundownChannelName || "event-rundowns" })
        .eq("id", selectedTenant.id)

      if (error) throw error

      setTenants(
        tenants.map((t) => (t.id === selectedTenant.id ? { ...t, rundown_channel_name: rundownChannelName } : t)),
      )
      setRundownChannelDialogOpen(false)
    } catch (err) {
      console.error("[v0] Error updating rundown channel:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditGoogleDrive = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setGoogleDriveUrl(tenant.google_drive_url || "")
    setGoogleDriveDialogOpen(true)
  }

  const handleSaveGoogleDrive = async () => {
    if (!selectedTenant) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("church_tenants")
        .update({ google_drive_url: googleDriveUrl || null })
        .eq("id", selectedTenant.id)

      if (error) throw error

      setTenants(tenants.map((t) => (t.id === selectedTenant.id ? { ...t, google_drive_url: googleDriveUrl } : t)))
      setGoogleDriveDialogOpen(false)
    } catch (err) {
      console.error("[v0] Error updating Google Drive URL:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureSlackChat = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setStripeChatDialogOpen(true)
  }

  const handleConfigureSlackBot = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setStripeBotConfigDialogOpen(true)
  }

  const handleAddSuperAdmin = () => {
    setEditingSuperAdmin(null)
    setSuperAdminEmail("")
    setSuperAdminFullName("")
    setIsSuperAdminDialogOpen(true)
  }

  const handleEditSuperAdmin = (admin: SuperAdmin) => {
    setEditingSuperAdmin(admin)
    setSuperAdminEmail(admin.email)
    setSuperAdminFullName(admin.full_name || "")
    setIsSuperAdminDialogOpen(true)
  }

  const handleSaveSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingSuperAdmin) {
        const { error } = await supabase
          .from("users")
          .update({ full_name: superAdminFullName })
          .eq("id", editingSuperAdmin.id)

        if (error) throw error

        setSuperAdmins(
          superAdmins.map((admin) =>
            admin.id === editingSuperAdmin.id ? { ...admin, full_name: superAdminFullName } : admin,
          ),
        )
      } else {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
          console.error("[v0] Error fetching auth users:", authError)
          alert("Error: Unable to verify user. Please ensure the user has signed up first.")
          return
        }

        const authUser = authUsers.users.find((u) => u.email === superAdminEmail)

        if (!authUser) {
          alert("Error: User with this email doesn't exist. They must sign up first.")
          return
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("id, is_super_admin")
          .eq("id", authUser.id)
          .maybeSingle()

        if (existingUser) {
          const { error } = await supabase
            .from("users")
            .update({
              is_super_admin: true,
              role: "super_admin",
              full_name: superAdminFullName || existingUser.full_name,
            })
            .eq("id", authUser.id)

          if (error) throw error

          const newAdmin = {
            id: authUser.id,
            email: superAdminEmail,
            full_name: superAdminFullName || existingUser.full_name || null,
            created_at: new Date().toISOString(),
          }
          setSuperAdmins([newAdmin, ...superAdmins])
        } else {
          const { data, error } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: superAdminEmail,
              full_name: superAdminFullName,
              role: "super_admin",
              is_super_admin: true,
              church_tenant_id: null,
            })
            .select()
            .single()

          if (error) throw error

          setSuperAdmins([data, ...superAdmins])
        }
      }

      setIsSuperAdminDialogOpen(false)
      setSuperAdminEmail("")
      setSuperAdminFullName("")
    } catch (err) {
      console.error("[v0] Error saving super admin:", err)
      alert("Error saving super admin. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSuperAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove super admin privileges from this user?")) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_super_admin: false,
          role: "member",
        })
        .eq("id", adminId)

      if (error) throw error

      setSuperAdmins(superAdmins.filter((admin) => admin.id !== adminId))
    } catch (err) {
      console.error("[v0] Error removing super admin:", err)
      alert("Error removing super admin. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureGoogleDriveApi = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setGoogleDriveApiKey("")
    setGoogleDriveApiDialogOpen(true)
  }

  const handleSaveGoogleDriveApi = async () => {
    if (!selectedTenant) return

    setLoading(true)
    try {
      const response = await fetch(`/api/church-tenant/update-google-drive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          churchTenantId: selectedTenant.id,
          apiKey: googleDriveApiKey,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save API key")
      }

      alert("Google Drive API key saved successfully!")
      setGoogleDriveApiDialogOpen(false)
    } catch (err) {
      console.error("[v0] Error saving Google Drive API key:", err)
      alert(`Failed to save API key: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSetupWizard = (tenant: Tenant) => {
    setSetupWizardChurch(tenant)
    setSetupWizardOpen(true)
  }

  const handleSetupComplete = () => {
    // Refresh tenant data
    router.refresh()
  }

  const handleConfigureStripe = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setStripeConfigDialogOpen(true)
  }

  const handleCreateStripePrices = async () => {
    setStripePricingLoading(true)
    setStripePriceIds(null)

    try {
      const response = await fetch("/api/admin/create-stripe-prices", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create prices")
      }

      const data = await response.json()
      setStripePriceIds(data)
    } catch (err) {
      console.error("[v0] Error creating Stripe prices:", err)
      alert(`Failed to create prices: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setStripePricingLoading(false)
    }
  }

  const handleExportUsers = async () => {
    try {
      const response = await fetch("/api/super-admin/users/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error exporting users:", error)
      alert("Failed to export users")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button variant="outline" onClick={() => setStripePricingDialogOpen(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Create Stripe Prices
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Quick Access</h2>
          <p className="text-sm text-muted-foreground mb-4">Manage your SaaS platform</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardNavigationItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-4 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("churches")}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === "churches"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Church Tenants
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === "admins"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Super Admins
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === "blog"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Blog
          </button>
        </div>

        {activeTab === "churches" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Church Tenants</h2>
                <p className="text-sm text-muted-foreground">Manage all church organizations</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Church
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Church Tenant</DialogTitle>
                    <DialogDescription>Add a new church organization to the system</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Church Name</Label>
                      <Input
                        id="name"
                        value={newTenantName}
                        onChange={(e) => {
                          setNewTenantName(e.target.value)
                          setNewTenantSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                        }}
                        placeholder="First Baptist Church"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL identifier)</Label>
                      <Input
                        id="slug"
                        value={newTenantSlug}
                        onChange={(e) => setNewTenantSlug(e.target.value)}
                        placeholder="first-baptist-church"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating..." : "Create Church"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tenants.map((tenant) => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {tenant.logo_url ? (
                        <img
                          src={tenant.logo_url || "/placeholder.svg"}
                          alt={tenant.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-primary" />
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleViewTenant(tenant.id)}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="mt-4">{tenant.name}</CardTitle>
                    <CardDescription>/{tenant.slug}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      Created {new Date(tenant.created_at).toLocaleDateString()}
                    </p>
                    {tenant.lead_admin_name && (
                      <div className="mb-3 p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Lead Admin</p>
                        <p className="font-medium text-sm">{tenant.lead_admin_name}</p>
                      </div>
                    )}
                    {tenant.church_code && (
                      <div className="mb-3 p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Church Code</p>
                        <p className="font-mono font-bold text-sm">{tenant.church_code}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenSetupWizard(tenant)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Setup Wizard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleAssignLeadAdmin(tenant)}
                      >
                        <UserCircle className="w-4 h-4 mr-2" />
                        {tenant.lead_admin_id ? "Change Lead Admin" : "Assign Lead Admin"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleEditTheme(tenant)}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Customize Theme
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleViewCode(tenant)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Manage Access Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleEditSlackUrl(tenant)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Set Slack Workspace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleEditRundownChannel(tenant)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Set Rundown Channel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleEditGoogleDrive(tenant)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Set Google Drive
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleConfigureGoogleDriveApi(tenant)}
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Configure Google Drive API
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleConfigureSlackChat(tenant)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Configure Slack Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleConfigureSlackBot(tenant)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Configure Slack Bot
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => router.push(`/dashboard/sms-notifications?tenant=${tenant.id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Configure SMS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleConfigureStripe(tenant)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Configure Stripe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {tenants.length === 0 && (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No churches yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Get started by creating your first church tenant</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Church
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === "admins" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Super Administrators</h2>
                <p className="text-sm text-muted-foreground">Manage users with full system access</p>
              </div>
              <Button onClick={handleAddSuperAdmin}>
                <Plus className="w-4 h-4 mr-2" />
                Add Super Admin
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {superAdmins.map((admin) => (
                <Card key={admin.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <UserCircle className="w-8 h-8 text-primary" />
                      <Button variant="ghost" size="sm" onClick={() => handleEditSuperAdmin(admin)}>
                        Edit
                      </Button>
                    </div>
                    <CardTitle className="mt-4">{admin.full_name || "No name set"}</CardTitle>
                    <CardDescription>{admin.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                      Added {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRemoveSuperAdmin(admin.id)}
                      disabled={loading}
                    >
                      Remove Super Admin
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {superAdmins.length === 0 && (
              <Card className="p-12 text-center">
                <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No super admins yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first super administrator</p>
                <Button onClick={handleAddSuperAdmin}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Super Admin
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === "blog" && <BlogManagement />}
      </main>

      <Dialog open={isSuperAdminDialogOpen} onOpenChange={setIsSuperAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSuperAdmin ? "Edit Super Admin" : "Add Super Admin"}</DialogTitle>
            <DialogDescription>
              {editingSuperAdmin
                ? "Update super admin information"
                : "Add a new user with full system access. The user must have an account first."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSuperAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                value={superAdminEmail}
                onChange={(e) => setSuperAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={!!editingSuperAdmin}
              />
              {!editingSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  The user must have signed up first before being made a super admin
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input
                id="admin-name"
                value={superAdminFullName}
                onChange={(e) => setSuperAdminFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : editingSuperAdmin ? "Update Super Admin" : "Add Super Admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {selectedTenant && (
        <>
          <ChurchThemeEditorDialog open={themeEditorOpen} onOpenChange={setThemeEditorOpen} church={selectedTenant} />
          <AssignLeadAdminDialog
            open={leadAdminDialogOpen}
            onOpenChange={setLeadAdminDialogOpen}
            churchId={selectedTenant.id}
            churchName={selectedTenant.name}
            currentLeadAdminId={selectedTenant.lead_admin_id}
            onLeadAdminAssigned={handleLeadAdminAssigned}
          />
          <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Church Access Code</DialogTitle>
                <DialogDescription>Manage the access code for {selectedTenant.name}</DialogDescription>
              </DialogHeader>
              <ChurchCodeDisplay
                churchId={selectedTenant.id}
                churchName={selectedTenant.name}
                currentCode={selectedTenant.church_code || ""}
                onCodeUpdated={(newCode) => handleCodeUpdated(selectedTenant.id, newCode)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={slackUrlDialogOpen} onOpenChange={setSlackUrlDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Slack Workspace URL</DialogTitle>
                <DialogDescription>
                  Set the Slack workspace URL for {selectedTenant.name}. This will be shown to users in the sidebar and
                  onboarding banner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-url">Workspace URL</Label>
                  <Input
                    id="slack-url"
                    value={slackWorkspaceUrl}
                    onChange={(e) => setSlackWorkspaceUrl(e.target.value)}
                    placeholder="https://yourchurch.slack.com"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: https://yourchurch.slack.com or https://app.slack.com/client/T1234567890
                  </p>
                </div>
                <Button onClick={handleSaveSlackUrl} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Workspace URL"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={rundownChannelDialogOpen} onOpenChange={setRundownChannelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rundown Slack Channel</DialogTitle>
                <DialogDescription>
                  Choose which Slack channel to send event rundowns to for {selectedTenant.name}. The channel will be
                  created automatically if it doesn't exist.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-name">Channel Name</Label>
                  <Input
                    id="channel-name"
                    value={rundownChannelName}
                    onChange={(e) => setRundownChannelName(e.target.value.replace(/[^a-z0-9-_]/g, ""))}
                    placeholder="event-rundowns"
                    maxLength={80}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use lowercase letters, numbers, hyphens, and underscores only. No spaces or special characters.
                  </p>
                </div>
                <Button onClick={handleSaveRundownChannel} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Channel"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={googleDriveDialogOpen} onOpenChange={setGoogleDriveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Google Drive URL</DialogTitle>
                <DialogDescription>
                  Set the Google Drive folder URL for {selectedTenant.name}. This will be shown to users in the sidebar
                  for easy access to shared media.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-drive-url">Google Drive Folder URL</Label>
                  <Input
                    id="google-drive-url"
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Share a Google Drive folder and paste the link here. Make sure the folder is shared with your church
                    members.
                  </p>
                </div>
                <Button onClick={handleSaveGoogleDrive} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Google Drive URL"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <ConfigureSlackChatDialog
            open={stripeChatDialogOpen}
            onOpenChange={setStripeChatDialogOpen}
            church={selectedTenant}
          />
          <Dialog open={stripeBotConfigDialogOpen} onOpenChange={setStripeBotConfigDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configure Slack Bot</DialogTitle>
                <DialogDescription>
                  Set up the Slack bot credentials for {selectedTenant?.name}. This allows the /attendance command and
                  other Slack integrations to work.
                </DialogDescription>
              </DialogHeader>
              <SlackBotSetup tenantId={selectedTenant?.id} />
            </DialogContent>
          </Dialog>
          <Dialog open={stripeConfigDialogOpen} onOpenChange={setStripeConfigDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configure Stripe</DialogTitle>
                <DialogDescription>
                  Set up Stripe payment processing for {selectedTenant?.name}. This enables online giving and payment
                  features.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescriptionComponent className="text-sm">
                    <strong>How to get Stripe API keys:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>
                        Go to{" "}
                        <a
                          href="https://dashboard.stripe.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Stripe Dashboard
                        </a>
                      </li>
                      <li>Sign in or create a Stripe account</li>
                      <li>Go to Developers → API keys</li>
                      <li>Copy your Publishable key and Secret key</li>
                      <li>For production, toggle to "Live mode" and copy those keys</li>
                    </ol>
                  </AlertDescriptionComponent>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  Stripe configuration is managed through environment variables. Please add the following to your Vercel
                  project:
                </p>
                <div className="space-y-2 p-4 bg-muted rounded-md font-mono text-sm">
                  <div>STRIPE_PUBLISHABLE_KEY</div>
                  <div>STRIPE_SECRET_KEY</div>
                  <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can add these in the <strong>Vars</strong> section of the in-chat sidebar or in your Vercel
                  project settings.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={googleDriveApiDialogOpen} onOpenChange={setGoogleDriveApiDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Google Drive API</DialogTitle>
                <DialogDescription>
                  Set up the Google Drive API key for {selectedTenant.name} to enable the file browser in Media Assets.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescriptionComponent className="text-sm">
                    <strong>How to get a Google Drive API key:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>
                        Go to{" "}
                        <a
                          href="https://console.cloud.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Google Cloud Console
                        </a>
                      </li>
                      <li>Create a new project or select an existing one</li>
                      <li>Go to APIs & Services → Library</li>
                      <li>Search for "Google Drive API" and enable it</li>
                      <li>Go to APIs & Services → Credentials</li>
                      <li>Click "Create Credentials" → "API Key"</li>
                      <li>Copy the API key and paste it below</li>
                    </ol>
                  </AlertDescriptionComponent>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="google-drive-api-key">Google Drive API Key</Label>
                  <Input
                    id="google-drive-api-key"
                    value={googleDriveApiKey}
                    onChange={(e) => setGoogleDriveApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    This key will be stored securely and used to fetch files from Google Drive.
                  </p>
                </div>
                <Button onClick={handleSaveGoogleDriveApi} disabled={loading || !googleDriveApiKey} className="w-full">
                  {loading ? "Saving..." : "Save API Key"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {setupWizardChurch && (
        <ChurchSetupWizard
          open={setupWizardOpen}
          onOpenChange={setSetupWizardOpen}
          churchId={setupWizardChurch.id}
          churchName={setupWizardChurch.name}
          onSetupComplete={handleSetupComplete}
        />
      )}

      <Dialog open={stripePricingDialogOpen} onOpenChange={setStripePricingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Stripe Prices</DialogTitle>
            <DialogDescription>
              Create the new Growth plan ($89/month) and Social Media add-on ($14/month) prices in Stripe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!stripePriceIds && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescriptionComponent className="text-sm">
                    This will create two new prices in your Stripe account:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Growth Plan: $89/month (recurring)</li>
                      <li>Social Media Scheduling Add-on: $14/month (recurring)</li>
                    </ul>
                  </AlertDescriptionComponent>
                </Alert>
                <Button onClick={handleCreateStripePrices} disabled={stripePricingLoading} className="w-full" size="lg">
                  {stripePricingLoading ? "Creating Prices..." : "Create Stripe Prices"}
                </Button>
              </>
            )}

            {stripePriceIds && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescriptionComponent className="text-sm font-semibold text-green-600">
                    ✓ Prices created successfully!
                  </AlertDescriptionComponent>
                </Alert>

                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-md">
                    <Label className="text-sm font-semibold">Growth Plan $89 Price ID:</Label>
                    <div className="mt-2 p-2 bg-background rounded border font-mono text-sm break-all">
                      {stripePriceIds.growthPriceId}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-md">
                    <Label className="text-sm font-semibold">Social Media Add-on $14 Price ID:</Label>
                    <div className="mt-2 p-2 bg-background rounded border font-mono text-sm break-all">
                      {stripePriceIds.socialMediaPriceId}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescriptionComponent className="text-sm">
                    <strong>Next Steps:</strong> Copy these price IDs and send them to v0 to update the code
                    configuration.
                  </AlertDescriptionComponent>
                </Alert>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
