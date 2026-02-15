"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Search, Download, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ErrorLog {
  id: string
  error_type: string
  message: string
  severity: string
  path: string
  method: string
  stack_trace: string | null
  metadata: any
  created_at: string
  resolved: boolean
  resolved_at: string | null
  user_id: string | null
  tenant_id: string | null
  user_agent: string | null
}

interface ErrorStats {
  total: number
  critical: number
  error: number
  warning: number
  info: number
  unresolved: number
}

export default function ErrorLogsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    error: 0,
    warning: 0,
    info: 0,
    unresolved: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unresolved">("unresolved")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadErrors()
    loadStats()
  }, [filter, severityFilter])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadErrors()
        loadStats()
      }, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, filter, severityFilter])

  async function loadErrors() {
    const supabase = createClient()
    let query = supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(100)

    if (filter === "unresolved") {
      query = query.eq("resolved", false)
    }

    if (severityFilter !== "all") {
      query = query.eq("severity", severityFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Failed to load errors:", error)
    } else {
      setErrors(data || [])
    }
    setLoading(false)
  }

  async function loadStats() {
    const supabase = createClient()
    const { data: allErrors } = await supabase.from("error_logs").select("severity, resolved")

    if (allErrors) {
      const stats: ErrorStats = {
        total: allErrors.length,
        critical: allErrors.filter((e) => e.severity === "critical").length,
        error: allErrors.filter((e) => e.severity === "error").length,
        warning: allErrors.filter((e) => e.severity === "warning").length,
        info: allErrors.filter((e) => e.severity === "info").length,
        unresolved: allErrors.filter((e) => !e.resolved).length,
      }
      setStats(stats)
    }
  }

  async function markResolved(errorId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("error_logs")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", errorId)

    if (!error) {
      loadErrors()
      loadStats()
    }
  }

  async function exportErrors() {
    const supabase = createClient()
    const { data } = await supabase.from("error_logs").select("*").order("created_at", { ascending: false })

    if (data) {
      const csv = [
        ["Date", "Type", "Severity", "Message", "Path", "Method", "Resolved"].join(","),
        ...data.map((e) =>
          [
            new Date(e.created_at).toISOString(),
            e.error_type,
            e.severity,
            `"${e.message.replace(/"/g, '""')}"`,
            e.path || "",
            e.method || "",
            e.resolved ? "Yes" : "No",
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `error-logs-${new Date().toISOString()}.csv`
      a.click()
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const filteredErrors = errors.filter(
    (error) =>
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.error_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.path?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Error Logs</h1>
        <p className="text-muted-foreground">Monitor and resolve system errors</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.unresolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.error}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="all">All Errors</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={autoRefresh ? "default" : "outline"}
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
          Auto-Refresh: {autoRefresh ? "ON" : "OFF"}
        </Button>
        <Button variant="outline" onClick={exportErrors}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <p>Loading errors...</p>
      ) : filteredErrors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery ? "No errors match your search" : "No errors found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((error) => (
            <Card key={error.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(error.severity)}
                    <CardTitle className="text-lg">{error.error_type}</CardTitle>
                    <Badge variant={error.resolved ? "secondary" : "destructive"}>
                      {error.resolved ? "Resolved" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{error.error_type}</DialogTitle>
                          <DialogDescription>{new Date(error.created_at).toLocaleString()}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-1">Message</h4>
                            <p className="text-sm">{error.message}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Details</h4>
                            <div className="text-sm space-y-1">
                              <p>Path: {error.path || "N/A"}</p>
                              <p>Method: {error.method || "N/A"}</p>
                              <p>Severity: {error.severity}</p>
                              <p>User Agent: {error.user_agent || "N/A"}</p>
                            </div>
                          </div>
                          {error.stack_trace && (
                            <div>
                              <h4 className="font-semibold mb-1">Stack Trace</h4>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">{error.stack_trace}</pre>
                            </div>
                          )}
                          {error.metadata && (
                            <div>
                              <h4 className="font-semibold mb-1">Metadata</h4>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {JSON.stringify(error.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {!error.resolved && (
                      <Button size="sm" variant="outline" onClick={() => markResolved(error.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>{new Date(error.created_at).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 font-medium">{error.message}</p>
                <div className="text-sm text-muted-foreground">
                  <p>Path: {error.path || "N/A"}</p>
                  <p>Method: {error.method || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
