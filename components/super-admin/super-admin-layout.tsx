"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  UserCog,
  AlertCircle,
  FileSignature,
  Presentation,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface SuperAdminLayoutProps {
  children: React.ReactNode
  user: any
}

export function SuperAdminLayout({ children, user }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navigationGroups = [
    {
      title: "Overview",
      items: [{ name: "Dashboard", href: "/super-admin", icon: LayoutDashboard }],
    },
    {
      title: "Management",
      items: [
        { name: "Tenants", href: "/super-admin/tenants", icon: Building2 },
        { name: "Users", href: "/super-admin/users", icon: Users },
        { name: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
        { name: "Business Plan Users", href: "/super-admin/business-plan-users", icon: UserCog },
        { name: "NDA Signatures", href: "/super-admin/nda-signatures", icon: FileSignature },
      ],
    },
    {
      title: "Resources",
      items: [
        { name: "Media Assets", href: "/super-admin/media-assets", icon: FolderOpen },
        { name: "Pitch Deck", href: "/super-admin/pitch-deck", icon: Presentation },
        { name: "Financial Projections", href: "/super-admin/financial-projections", icon: DollarSign },
        { name: "Marketing Strategy", href: "/super-admin/marketing-strategy", icon: TrendingUp },
        { name: "View Business Plan", href: "/business-plan", icon: FileText },
      ],
    },
    {
      title: "Configuration",
      items: [
        { name: "Settings", href: "/super-admin/settings", icon: Settings },
        { name: "Error Logs", href: "/super-admin/error-logs", icon: AlertCircle },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-xl">Super Admin</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-accent">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border/50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-bold text-2xl">Super Admin</h1>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">System Administrator</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

                    return (
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
              </div>
            ))}
          </nav>

          {/* Logout button */}
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

      {/* Main content */}
      <main className="lg:pl-72 pt-20 lg:pt-0 min-h-screen">
        <div className="container mx-auto px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
