"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

interface SyncLog {
  id: string
  sync_started_at: string
  sync_completed_at: string | null
  total_tenants: number
  successful_tenants: number
  total_users_synced: number
  status: "running" | "completed" | "failed"
  errors: any
}

export function SyncLogsViewer() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from("user_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) {
      setLogs(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading sync logs...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic User Sync Logs</CardTitle>
        <CardDescription>System automatically syncs users every 24 hours at 2:00 AM UTC</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sync logs yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {log.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {log.status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                    {log.status === "running" && <Clock className="h-4 w-4 text-blue-600" />}
                    <span className="text-sm font-medium">{new Date(log.sync_started_at).toLocaleString()}</span>
                    <Badge variant={log.status === "completed" ? "default" : "secondary"}>{log.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Synced {log.total_users_synced} users across {log.successful_tenants}/{log.total_tenants} tenants
                  </div>
                  {log.errors && <div className="text-xs text-red-600">Errors: {JSON.stringify(log.errors)}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
