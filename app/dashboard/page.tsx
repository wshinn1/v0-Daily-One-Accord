import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SlackSetupBanner } from "@/components/onboarding/slack-setup-banner"
import { GoogleDriveSetupBanner } from "@/components/onboarding/google-drive-setup-banner"
import Link from "next/link"
import { sanitizeTenantId } from "@/lib/utils/tenant"
import { isMenuItemVisible } from "@/lib/permissions/menu-visibility"
import {
  Users,
  Calendar,
  BarChart3,
  Layers,
  Mail,
  UserCog,
  Settings,
  ClipboardList,
  Bell,
  FolderOpen,
  MessageSquare,
  GraduationCap,
} from "lucide-react"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  console.log("[v0] Dashboard - User data query result:", userData)
  console.log("[v0] Dashboard - User data query error:", userError)

  if (!userData) {
    redirect("/setup-profile")
  }

  console.log("[v0] Dashboard - User is_super_admin:", userData.is_super_admin)
  console.log("[v0] Dashboard - User church_tenant_id:", userData.church_tenant_id)

  const tenantId = sanitizeTenantId(params.tenant)

  console.log("[v0] Dashboard - URL tenant parameter:", tenantId)

  if (userData.is_super_admin && !tenantId && !userData.church_tenant_id) {
    console.log("[v0] Dashboard - Super admin without tenant, redirecting to /super-admin")
    redirect("/super-admin")
  }

  const churchTenantId = tenantId || userData.church_tenant_id

  console.log("[v0] Dashboard - Final churchTenantId:", churchTenantId)

  if (!churchTenantId) {
    console.log("[v0] Dashboard - No church tenant ID, redirecting to setup-profile")
    redirect("/setup-profile")
  }

  const { data: tenantInfo, error: tenantError } = await supabase
    .from("church_tenants")
    .select("*")
    .eq("id", churchTenantId)
    .maybeSingle()

  console.log("[v0] Dashboard - Tenant info:", tenantInfo)
  console.log("[v0] Dashboard - Tenant error:", tenantError)

  if (!tenantInfo) {
    console.log("[v0] Dashboard - No tenant info found for ID:", churchTenantId)
    redirect("/super-admin")
  }

  const { data: memberData, error: memberError } = await supabase
    .from("church_members")
    .select("slack_connected")
    .eq("user_id", user.id)
    .eq("church_tenant_id", churchTenantId)
    .maybeSingle()

  const slackConnected = memberError ? false : memberData?.slack_connected || false

  const { count: membersCount, error: membersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("church_tenant_id", churchTenantId)

  if (membersError) {
    console.log("[v0] Dashboard - Error fetching members count:", membersError)
  }

  const { count: visitorsCountRaw, error: visitorsError } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("church_tenant_id", churchTenantId)
    .eq("status", "new")

  if (visitorsError) {
    console.log("[v0] Dashboard - Error fetching visitors count:", visitorsError)
  }
  const visitorsCount = visitorsError ? 0 : visitorsCountRaw || 0

  const { count: eventsCountRaw, error: eventsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("church_tenant_id", churchTenantId)
    .gte("start_time", new Date().toISOString())

  if (eventsError) {
    console.log("[v0] Dashboard - Error fetching events count:", eventsError)
  }
  const eventsCount = eventsError ? 0 : eventsCountRaw || 0

  const { data: ministryTeams, error: ministryError } = await supabase
    .from("ministry_teams")
    .select("id")
    .eq("church_tenant_id", churchTenantId)

  const { data: volunteerTeams, error: volunteerError } = await supabase
    .from("volunteer_teams")
    .select("id")
    .eq("church_tenant_id", churchTenantId)

  if (ministryError) {
    console.log("[v0] Dashboard - Error fetching ministry teams:", ministryError)
  }
  if (volunteerError) {
    console.log("[v0] Dashboard - Error fetching volunteer teams:", volunteerError)
  }

  const totalTeams = (ministryTeams?.length || 0) + (volunteerTeams?.length || 0)

  const displayUser = {
    ...userData,
    church_tenants: tenantInfo,
    church_tenant_id: churchTenantId,
  }

  const tenantTheme = {
    logo_url: tenantInfo?.logo_url,
    primary_color: tenantInfo?.primary_color,
    secondary_color: tenantInfo?.secondary_color,
    accent_color: tenantInfo?.accent_color,
    background_color: tenantInfo?.background_color,
    text_color: tenantInfo?.text_color,
    heading_font: tenantInfo?.heading_font,
    body_font: tenantInfo?.body_font,
    font_size_base: tenantInfo?.font_size_base,
    font_size_heading: tenantInfo?.font_size_heading,
  }

  const { data: tenantData } = await supabase
    .from("church_tenants")
    .select("slack_bot_token")
    .eq("id", churchTenantId)
    .single()

  const slackConfigured = !!tenantData?.slack_bot_token

  const getHref = (path: string) => {
    if (tenantId) {
      return `${path}?tenant=${tenantId}`
    }
    return path
  }

  const isMediaTeam = userData.role === "media_team"

  const { data: visibilitySettings } = await supabase
    .from("menu_visibility_settings")
    .select("*")
    .eq("church_tenant_id", churchTenantId)

  const checkVisibility = (menuKey: string): boolean => {
    return isMenuItemVisible(menuKey, userData.role || "member", visibilitySettings || [])
  }

  const allNavigationItems = [
    {
      key: "dashboard_visitors",
      name: "Visitors",
      href: getHref("/dashboard/visitors"),
      icon: Users,
      description: "Manage visitor information",
      count: visitorsCount,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      key: "dashboard_calendar",
      name: "Calendar",
      href: getHref("/dashboard/calendar"),
      icon: Calendar,
      description: "View and manage events",
      count: eventsCount,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      key: "dashboard_attendance",
      name: "Attendance",
      href: getHref("/dashboard/attendance"),
      icon: BarChart3,
      description: "Track attendance records",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      key: "dashboard_teams",
      name: "Teams",
      href: getHref("/dashboard/teams"),
      icon: Layers,
      description: "Manage ministry teams",
      count: totalTeams,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      key: "dashboard_classes",
      name: "Classes",
      href: getHref("/dashboard/classes"),
      icon: GraduationCap,
      description: "Manage church classes",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "dashboard_newsletter",
      name: "Newsletter",
      href: getHref("/dashboard/newsletter"),
      icon: Mail,
      description: "Send email newsletters",
      color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    },
    {
      key: "dashboard_sms",
      name: "SMS Notifications",
      href: getHref("/dashboard/sms-notifications"),
      icon: Bell,
      description: "Schedule and send SMS",
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    {
      key: "dashboard_rundowns",
      name: "Rundowns",
      href: getHref("/dashboard/rundowns"),
      icon: ClipboardList,
      description: "Service rundowns",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "dashboard_slack",
      name: "Slack",
      href: getHref("/dashboard/slack"),
      icon: MessageSquare,
      description: "Team communication",
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    },
    ...(tenantInfo?.google_drive_url
      ? [
          {
            key: "dashboard_media",
            name: "Media Assets",
            href: getHref("/dashboard/media-assets"),
            icon: FolderOpen,
            description: "Manage media files",
            color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
          },
        ]
      : []),
    {
      key: "dashboard_users",
      name: "Users",
      href: getHref("/dashboard/users"),
      icon: UserCog,
      description: "Manage church members",
      count: membersCount || 0,
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      key: "dashboard_settings",
      name: "Settings",
      href: getHref("/dashboard/settings"),
      icon: Settings,
      description: "Church configuration",
      color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    },
  ]

  const navigationItems = isMediaTeam
    ? allNavigationItems.filter((item) => item.key === "dashboard_media")
    : allNavigationItems.filter((item) => checkVisibility(item.key))

  const isAdminOrLeadAdmin = userData.role === "lead_admin" || userData.role === "admin_staff"

  return (
    <DashboardLayout user={displayUser} tenantId={tenantId} tenantTheme={tenantTheme}>
      <div className="space-y-6">
        {!userData.is_super_admin && !isMediaTeam && (
          <SlackSetupBanner tenantId={churchTenantId} slackConfigured={slackConfigured} />
        )}
        {!userData.is_super_admin && isAdminOrLeadAdmin && !isMediaTeam && (
          <GoogleDriveSetupBanner tenantId={churchTenantId} googleDriveConfigured={!!tenantInfo?.google_drive_url} />
        )}

        <div>
          {userData.is_super_admin && tenantId && (
            <p className="text-sm text-muted-foreground mb-2">Viewing: {tenantInfo?.name}</p>
          )}
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {isMediaTeam ? "Access your media assets" : "Welcome to your church management system"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {navigationItems.map((item) => (
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
                      {item.count !== undefined && <p className="text-2xl font-bold text-primary pt-2">{item.count}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!isMediaTeam && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{membersCount || 0}</div>
                <p className="text-xs text-muted-foreground">Active church members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorsCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting follow up</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventsCount}</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
                <p className="text-xs text-muted-foreground">Ministry & volunteer</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
