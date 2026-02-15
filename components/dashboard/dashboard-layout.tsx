"use client"

import type React from "react"
import { EmbeddedSlackChat } from "@/components/slack/embedded-slack-chat"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { MenuSyncInitializer } from "@/components/dashboard/menu-sync-initializer"
import { BoardListSidebar } from "@/components/kanban/board-list-sidebar"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Layers,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  BookOpen,
  ExternalLink,
  UserCog,
  Shield,
  ClipboardList,
  FolderOpen,
  Bell,
  GraduationCap,
  MessageCircle,
  Video,
  Eye,
  DollarSign,
  Heart,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"
import { isMenuItemVisible } from "@/lib/permissions/menu-visibility"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  tenantId?: string | null
  tenantTheme?: {
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
  }
}

export function DashboardLayout({ children, user, tenantId, tenantTheme }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visibilitySettings, setVisibilitySettings] = useState<any[]>([])
  const [visibilityLoaded, setVisibilityLoaded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()

  const isMediaTeam = user?.role === "media_team"

  useEffect(() => {
    const fetchVisibilitySettings = async () => {
      try {
        const response = await fetch("/api/menu-visibility")
        if (response.ok) {
          const data = await response.json()
          setVisibilitySettings(data.visibilitySettings || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching visibility settings:", error)
      } finally {
        setVisibilityLoaded(true)
      }
    }

    fetchVisibilitySettings()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getHref = (path: string) => {
    if (tenantId) {
      return `${path}?tenant=${tenantId}`
    }
    return path
  }

  const checkVisibility = (menuKey: string): boolean => {
    if (!visibilityLoaded) return true
    if (menuKey.startsWith("giving")) return true
    return isMenuItemVisible(menuKey, user?.role || "member", visibilitySettings)
  }

  const allNavigationGroups = [
    {
      title: "Overview",
      items: [
        {
          key: "dashboard",
          name: "Dashboard",
          href: getHref("/dashboard"),
          icon: LayoutDashboard,
          external: false,
        },
      ],
    },
    {
      title: "Visitor Management",
      items: [
        {
          key: "visitors",
          name: "Visitor Pipeline",
          href: getHref("/dashboard/visitors"),
          icon: Users,
          external: false,
        },
      ],
    },
    {
      title: "Unity",
      items: [],
      customContent: <BoardListSidebar userRole={user?.role} visibilitySettings={visibilitySettings} />,
    },
    {
      title: "Church Management",
      items: [
        {
          key: "members",
          name: "Members Directory",
          href: getHref("/dashboard/members"),
          icon: Users,
          external: false,
        },
        { key: "calendar", name: "Calendar", href: getHref("/dashboard/calendar"), icon: Calendar, external: false },
        {
          key: "rundowns",
          name: "Rundowns",
          href: getHref("/dashboard/rundowns"),
          icon: ClipboardList,
          external: false,
        },
        {
          key: "attendance",
          name: "Attendance",
          href: getHref("/dashboard/attendance"),
          icon: BarChart3,
          external: false,
        },
        { key: "teams", name: "Teams", href: getHref("/dashboard/teams"), icon: Layers, external: false },
        { key: "classes", name: "Classes", href: getHref("/dashboard/classes"), icon: GraduationCap, external: false },
      ],
    },
    {
      title: "Giving",
      items: [
        {
          key: "giving",
          name: "Giving Dashboard",
          href: getHref("/dashboard/giving"),
          icon: DollarSign,
          external: false,
        },
        {
          key: "campaigns",
          name: "Campaigns",
          href: getHref("/dashboard/giving/campaigns"),
          icon: Target,
          external: false,
        },
        {
          key: "donations",
          name: "Donations",
          href: getHref("/dashboard/giving/donations"),
          icon: Heart,
          external: false,
        },
        {
          key: "donors",
          name: "Donors",
          href: getHref("/dashboard/giving/donors"),
          icon: Users,
          external: false,
        },
        {
          key: "giving_analytics",
          name: "Analytics",
          href: getHref("/dashboard/giving/analytics"),
          icon: TrendingUp,
          external: false,
        },
        {
          key: "giving_reports",
          name: "Reports",
          href: getHref("/dashboard/giving/reports"),
          icon: FileText,
          external: false,
        },
        {
          key: "giving_settings",
          name: "Giving Settings",
          href: getHref("/dashboard/giving/settings"),
          icon: Settings,
          external: false,
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          key: "newsletter",
          name: "Newsletter",
          href: getHref("/dashboard/newsletter"),
          icon: Mail,
          external: false,
        },
        {
          key: "sms_notifications",
          name: "SMS Notifications",
          href: getHref("/dashboard/sms-notifications"),
          icon: Bell,
          external: false,
        },
        { key: "slack", name: "Slack", href: getHref("/dashboard/slack"), icon: MessageSquare, external: false },
        {
          key: "messaging",
          name: "Messaging",
          href: getHref("/dashboard/messaging"),
          icon: MessageCircle,
          external: false,
        },
        { key: "zoom", name: "Zoom", href: getHref("/dashboard/zoom"), icon: Video, external: false },
        ...(user.church_tenants?.slack_workspace_url
          ? [
              {
                key: "slack_workspace",
                name: "Slack Workspace",
                href: user.church_tenants.slack_workspace_url,
                icon: MessageSquare,
                external: true,
              },
            ]
          : []),
      ],
    },
    {
      title: "Resources",
      items: [
        {
          key: "bible_search",
          name: "Bible Search",
          href: "https://www.blueletterbible.org/",
          icon: BookOpen,
          external: true,
        },
        ...(user.church_tenants?.google_drive_url && !user?.is_super_admin
          ? [
              {
                key: "media_assets",
                name: "Media Assets",
                href: getHref("/dashboard/media-assets"),
                icon: FolderOpen,
                external: false,
              },
            ]
          : []),
      ],
    },
    {
      title: "Administration",
      items: [
        {
          key: "system_users",
          name: "System Users",
          href: getHref("/dashboard/users"),
          icon: UserCog,
          external: false,
        },
        ...(user?.role === "lead_admin"
          ? [
              {
                key: "menu_visibility",
                name: "Menu Visibility",
                href: getHref("/dashboard/settings/menu-visibility"),
                icon: Eye,
                external: false,
              },
            ]
          : []),
        { key: "settings", name: "Settings", href: getHref("/dashboard/settings"), icon: Settings, external: false },
      ],
    },
  ]

  const navigationGroups = isMediaTeam
    ? [
        {
          title: "Overview",
          items: [
            {
              key: "dashboard",
              name: "Dashboard",
              href: getHref("/dashboard"),
              icon: LayoutDashboard,
              external: false,
            },
          ],
        },
      ]
    : allNavigationGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => checkVisibility(item.key)),
        }))
        .filter((group) => group.items.length > 0 || group.customContent)

  const superAdminGroup = user?.is_super_admin
    ? {
        title: "Super Admin",
        items: [
          { key: "super_admin", name: "Super Admin", href: "/super-admin", icon: Shield, external: false },
          {
            key: "super_admin_media",
            name: "Media Assets",
            href: "/super-admin/media-assets",
            icon: FolderOpen,
            external: false,
          },
        ],
      }
    : null

  if (superAdminGroup && !isMediaTeam) {
    navigationGroups.push(superAdminGroup)
  }

  return (
    <ThemeProvider theme={tenantTheme || {}}>
      <MenuSyncInitializer />
      <div className="min-h-screen bg-background">
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 px-6 py-4 flex items-center justify-between">
          {tenantTheme?.logo_url ? (
            <img
              src={tenantTheme.logo_url || "/placeholder.svg"}
              alt={user.church_tenants?.name || "Church"}
              className="h-8 object-contain"
            />
          ) : (
            <h1 className="font-bold text-xl">{user.church_tenants?.name || "Church Management"}</h1>
          )}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border/50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-border/50">
              <div className="flex items-start justify-between mb-6">
                {tenantTheme?.logo_url ? (
                  <img
                    src={tenantTheme.logo_url || "/placeholder.svg"}
                    alt={user.church_tenants?.name || "Church"}
                    className="h-10 object-contain"
                  />
                ) : (
                  <h1 className="font-bold text-2xl">{user.church_tenants?.name || "Church Management"}</h1>
                )}
                <NotificationBell />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role?.replace(/_/g, " ")}</p>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
              {navigationGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  {group.customContent ? (
                    group.customContent
                  ) : (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== getHref("/dashboard") && pathname?.startsWith(item.href + "/")) ||
                          (group.title === "Giving" && pathname?.startsWith(getHref("/dashboard/giving")))

                        return item.external ? (
                          <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-all duration-200 group"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="flex-1">{item.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
                          </a>
                        ) : (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                              isActive
                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                : "text-foreground/70 hover:text-foreground hover:bg-accent/50",
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon
                              className={cn(
                                "w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform",
                                isActive && "text-primary",
                              )}
                            />
                            <span className="flex-1">{item.name}</span>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full bg-transparent hover:bg-accent/50 border-border/50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="lg:pl-72 pt-20 lg:pt-0 min-h-screen">
          <div className="container mx-auto px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">{children}</div>
        </main>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {!isMediaTeam && (
          <EmbeddedSlackChat
            tenantId={user.church_tenant_id || tenantId}
            isConfigured={!!user.church_tenants?.slack_oauth_configured}
            userName={user.full_name || user.email?.split("@")[0] || "Unknown User"}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
