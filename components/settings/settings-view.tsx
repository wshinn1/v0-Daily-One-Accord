"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, FolderOpen, Hash, MessageSquare, Key, MessageCircle, Video, Bell } from "lucide-react"
import { EditProfileDialog } from "./edit-profile-dialog"
import { ConfigureGoogleDriveDialog } from "./configure-google-drive-dialog"
import { ConfigureGoogleDriveApiDialog } from "./configure-google-drive-api-dialog"
import { ConfigureRundownChannelDialog } from "./configure-rundown-channel-dialog"
import { SmsSettingsCard } from "@/components/sms/sms-settings-card"
import { SlackBotSetup } from "@/components/slack/slack-bot-setup"
import { SlackBotDiagnostics } from "@/components/slack/slack-bot-diagnostics"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SubscriptionManagementCard } from "./subscription-management-card"

interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
  church_tenant_id: string
  church_tenants: {
    name: string
    google_drive_url?: string
    google_drive_api_key?: string
    rundown_channel_name?: string
  } | null
}

interface Role {
  id: string
  name: string
}

interface SettingsViewProps {
  user: User
  roles: Role[]
}

export function SettingsView({ user, roles }: SettingsViewProps) {
  const resendConfigured = !!process.env.NEXT_PUBLIC_RESEND_CONFIGURED
  const isAdmin = user.role === "lead_admin" || user.role === "admin_staff" || user.role === "pastoral_team"
  const isLeadAdmin = user.role === "lead_admin"

  console.log("[v0] SettingsView - User role:", user.role)
  console.log("[v0] SettingsView - isAdmin:", isAdmin)
  console.log("[v0] SettingsView - isLeadAdmin:", isLeadAdmin)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and church settings</p>
        </div>
        <EditProfileDialog user={user} />
      </div>

      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Integrations
            </CardTitle>
            <CardDescription>Configure third-party services for your church tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <Link href="/dashboard/slack">
                  <div className="flex items-center gap-3 w-full">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Slack Integration</p>
                      <p className="text-xs text-muted-foreground">Connect your Slack workspace</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <Link href="/dashboard/messaging">
                  <div className="flex items-center gap-3 w-full">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">GroupMe Integration</p>
                      <p className="text-xs text-muted-foreground">Bridge Slack and GroupMe</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <Link href="/dashboard/zoom">
                  <div className="flex items-center gap-3 w-full">
                    <Video className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Zoom Integration</p>
                      <p className="text-xs text-muted-foreground">Create meetings from Slack</p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start h-auto py-4 bg-transparent">
                <Link href="/dashboard/sms-notifications">
                  <div className="flex items-center gap-3 w-full">
                    <Bell className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Configure Telnyx SMS</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="secondary" className="capitalize">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Church Information</CardTitle>
            <CardDescription>Your church details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <p className="font-medium">{user.church_tenants?.name || "No church assigned"}</p>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Media Assets</CardTitle>
                <CardDescription>Google Drive integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      Folder:{" "}
                      {user.church_tenants?.google_drive_url ? (
                        <Badge variant="default">Configured</Badge>
                      ) : (
                        <Badge variant="secondary">Not Configured</Badge>
                      )}
                    </p>
                  </div>
                  <ConfigureGoogleDriveDialog
                    currentUrl={user.church_tenants?.google_drive_url}
                    churchTenantId={user.church_tenant_id}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      API Key:{" "}
                      {user.church_tenants?.google_drive_api_key ? (
                        <Badge variant="default">Configured</Badge>
                      ) : (
                        <Badge variant="secondary">Not Configured</Badge>
                      )}
                    </p>
                  </div>
                  <ConfigureGoogleDriveApiDialog
                    currentApiKey={user.church_tenants?.google_drive_api_key}
                    churchTenantId={user.church_tenant_id}
                  />
                </div>
                {!user.church_tenants?.google_drive_api_key && (
                  <p className="text-xs text-muted-foreground">
                    Configure your Google Drive API key to enable file browsing and previews.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rundown Channel</CardTitle>
                <CardDescription>Slack channel for event rundowns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {user.church_tenants?.rundown_channel_name || "event-rundowns"}
                    </p>
                  </div>
                  <ConfigureRundownChannelDialog
                    currentChannelName={user.church_tenants?.rundown_channel_name}
                    churchTenantId={user.church_tenant_id}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Default Slack channel where event rundowns will be published.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slack Bot Configuration</CardTitle>
                <CardDescription>Advanced Slack bot settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">{/* Placeholder for Slack Bot Configuration content */}</CardContent>
            </Card>

            <div className="md:col-span-2">
              <SlackBotSetup />
            </div>

            <div className="md:col-span-2">
              <SlackBotDiagnostics />
            </div>

            <SmsSettingsCard churchTenantId={user.church_tenant_id} />
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription>Resend API configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">
                Status:{" "}
                {resendConfigured ? (
                  <Badge variant="default">Configured</Badge>
                ) : (
                  <Badge variant="destructive">Not Configured</Badge>
                )}
              </p>
            </div>
            {!resendConfigured && (
              <p className="text-xs text-muted-foreground">
                Add RESEND_API_KEY to your environment variables to enable newsletter functionality.
              </p>
            )}
          </CardContent>
        </Card>

        {roles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Roles</CardTitle>
              <CardDescription>Church-specific roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role.id} variant="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isLeadAdmin && (
        <div className="w-full">
          <SubscriptionManagementCard churchTenantId={user.church_tenant_id} />
        </div>
      )}
    </div>
  )
}
