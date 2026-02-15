"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditLog {
  id: string
  user_id: string | null
  user_email: string | null
  church_tenant_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface AuditLogViewerProps {
  initialLogs: AuditLog[]
}

export function AuditLogViewer({ initialLogs }: AuditLogViewerProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || log.action === actionFilter

    return matchesSearch && matchesAction
  })

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("delete") || action.includes("revoke")) return "destructive"
    if (action.includes("create") || action.includes("grant")) return "default"
    if (action.includes("update")) return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by email, action, or resource..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No audit logs found</Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                    {log.resource_type && (
                      <span className="text-sm text-muted-foreground">
                        on <span className="font-medium">{log.resource_type}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{log.user_email || "System"}</span>
                    {log.details && (
                      <span className="text-muted-foreground ml-2">
                        {log.details.targetEmail && `→ ${log.details.targetEmail}`}
                        {log.details.email && `→ ${log.details.email}`}
                      </span>
                    )}
                  </div>
                  {log.ip_address && <div className="text-xs text-muted-foreground">IP: {log.ip_address}</div>}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-muted-foreground mt-2">
                      <summary className="cursor-pointer hover:text-foreground">View details</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
