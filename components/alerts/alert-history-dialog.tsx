"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface AlertHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  alertId: string
  alertName: string
}

export function AlertHistoryDialog({ isOpen, onClose, alertId, alertName }: AlertHistoryDialogProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen, alertId])

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/scheduled-alerts/${alertId}/logs`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alert History: {alertName}</DialogTitle>
          <DialogDescription>View execution history and status</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No execution history yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 flex items-start gap-3">
                {log.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{new Date(log.executed_at).toLocaleString()}</span>
                    <Badge variant={log.success ? "default" : "destructive"} className="text-xs">
                      {log.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  {log.error_message && <p className="text-sm text-muted-foreground">{log.error_message}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
