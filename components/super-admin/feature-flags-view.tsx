"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Flag, Users } from "lucide-react"

interface FeatureFlag {
  id: string
  flag_key: string
  name: string
  description: string
  enabled_by_default: boolean
  tenant_feature_flags: { count: number }[]
}

export function FeatureFlagsView() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    try {
      const res = await fetch("/api/super-admin/feature-flags")
      const data = await res.json()
      setFlags(data.flags || [])
    } catch (error) {
      console.error("Failed to fetch feature flags:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = async (flagId: string, currentValue: boolean) => {
    try {
      await fetch(`/api/super-admin/feature-flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled_by_default: !currentValue }),
      })
      fetchFlags()
    } catch (error) {
      console.error("Failed to toggle flag:", error)
    }
  }

  const filteredFlags = flags.filter(
    (flag) =>
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.flag_key.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const enabledCount = flags.filter((f) => f.enabled_by_default).length
  const totalOverrides = flags.reduce((sum, f) => sum + (f.tenant_feature_flags?.[0]?.count || 0), 0)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground">Control feature availability globally and per-tenant</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled by Default</CardTitle>
            <Flag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Overrides</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOverrides}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search feature flags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Feature Flags List */}
      <div className="space-y-4">
        {filteredFlags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{flag.name}</CardTitle>
                    {flag.enabled_by_default ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                  <CardDescription>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{flag.flag_key}</code>
                  </CardDescription>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                </div>
                <Switch
                  checked={flag.enabled_by_default}
                  onCheckedChange={() => toggleFlag(flag.id, flag.enabled_by_default)}
                />
              </div>
            </CardHeader>
            {flag.tenant_feature_flags?.[0]?.count > 0 && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{flag.tenant_feature_flags[0].count} tenant override(s)</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
