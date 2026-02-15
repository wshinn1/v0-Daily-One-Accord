"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SyncUsersButton() {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/users/sync-members", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync users")
      }

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.synced} user(s)`,
      })

      // Refresh the page to show updated users
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Sync error:", error)
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Users"}
    </Button>
  )
}
