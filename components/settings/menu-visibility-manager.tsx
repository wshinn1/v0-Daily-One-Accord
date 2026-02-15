"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
  key: string
  name: string
  category: string
  group_name?: string
  description?: string
  icon?: string
  href: string
  display_order: number
}

interface VisibilitySetting {
  id?: string
  church_tenant_id: string
  menu_item_key: string
  role: string
  is_visible: boolean
}

interface MenuVisibilityManagerProps {
  tenantId: string
}

const ROLES = [
  { value: "lead_admin", label: "Lead Admin", color: "bg-purple-500" },
  { value: "admin_staff", label: "Admin Staff", color: "bg-blue-500" },
  { value: "pastoral_team", label: "Pastoral Team", color: "bg-green-500" },
  { value: "volunteer_team", label: "Volunteer Team", color: "bg-yellow-500" },
  { value: "media_team", label: "Media Team", color: "bg-pink-500" },
  { value: "member", label: "Member", color: "bg-gray-500" },
]

export function MenuVisibilityManager({ tenantId }: MenuVisibilityManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState("admin_staff")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/menu-visibility")
      const data = await response.json()

      if (response.ok) {
        setMenuItems(data.menuItems || [])
        setVisibilitySettings(data.visibilitySettings || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load menu visibility settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching menu visibility:", error)
      toast({
        title: "Error",
        description: "Failed to load menu visibility settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isVisible = (menuItemKey: string, role: string): boolean => {
    const setting = visibilitySettings.find((s) => s.menu_item_key === menuItemKey && s.role === role)
    // Default to visible if no setting exists
    return setting ? setting.is_visible : true
  }

  const toggleVisibility = (menuItemKey: string, role: string) => {
    const currentVisibility = isVisible(menuItemKey, role)
    const existingSettingIndex = visibilitySettings.findIndex((s) => s.menu_item_key === menuItemKey && s.role === role)

    if (existingSettingIndex >= 0) {
      // Update existing setting
      const updated = [...visibilitySettings]
      updated[existingSettingIndex] = {
        ...updated[existingSettingIndex],
        is_visible: !currentVisibility,
      }
      setVisibilitySettings(updated)
    } else {
      // Add new setting
      setVisibilitySettings([
        ...visibilitySettings,
        {
          church_tenant_id: tenantId,
          menu_item_key: menuItemKey,
          role,
          is_visible: !currentVisibility,
        },
      ])
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/menu-visibility/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: visibilitySettings.map((s) => ({
            menuItemKey: s.menu_item_key,
            role: s.role,
            isVisible: s.is_visible,
          })),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu visibility settings saved successfully",
        })
        fetchData() // Refresh data
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("[v0] Error saving menu visibility:", error)
      toast({
        title: "Error",
        description: "Failed to save menu visibility settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setVisibilitySettings([])
    toast({
      title: "Reset",
      description: "Settings reset to defaults (all visible)",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const sidebarItems = menuItems.filter((item) => item.category === "sidebar")
  const dashboardItems = menuItems.filter((item) => item.category === "dashboard")

  // Group sidebar items by group_name
  const groupedSidebarItems = sidebarItems.reduce(
    (acc, item) => {
      const group = item.group_name || "Other"
      if (!acc[group]) acc[group] = []
      acc[group].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
          <CardDescription>Choose a role to configure menu visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <Button
                key={role.value}
                variant={selectedRole === role.value ? "default" : "outline"}
                onClick={() => setSelectedRole(role.value)}
                className="gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${role.color}`} />
                {role.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sidebar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sidebar">Sidebar Navigation</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="sidebar" className="space-y-4">
          {Object.entries(groupedSidebarItems).map(([groupName, items]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-lg">{groupName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <Label htmlFor={`${item.key}-${selectedRole}`} className="font-medium cursor-pointer">
                        {item.name}
                      </Label>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                    <Switch
                      id={`${item.key}-${selectedRole}`}
                      checked={isVisible(item.key, selectedRole)}
                      onCheckedChange={() => toggleVisibility(item.key, selectedRole)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dashboard Cards</CardTitle>
              <CardDescription>Control which cards appear on the main dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <Label htmlFor={`${item.key}-${selectedRole}`} className="font-medium cursor-pointer">
                      {item.name}
                    </Label>
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  </div>
                  <Switch
                    id={`${item.key}-${selectedRole}`}
                    checked={isVisible(item.key, selectedRole)}
                    onCheckedChange={() => toggleVisibility(item.key, selectedRole)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
        <Button onClick={resetToDefaults} variant="outline" className="gap-2 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
