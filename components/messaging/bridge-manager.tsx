"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, ArrowLeftRight } from "lucide-react"
import { CreateBridgeDialog } from "./create-bridge-dialog"

interface Bridge {
  id: string
  name: string
  enabled: boolean
  slack_channel_name: string
  groupme_group_name: string
  sync_direction: string
  include_sender_name: boolean
}

interface BridgeManagerProps {
  churchTenantId: string
}

export function BridgeManager({ churchTenantId }: BridgeManagerProps) {
  const [bridges, setBridges] = useState<Bridge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchBridges = async () => {
    try {
      const response = await fetch(`/api/bridges?churchTenantId=${churchTenantId}`)
      const data = await response.json()
      setBridges(data.bridges || [])
    } catch (error) {
      console.error("[v0] Failed to fetch bridges:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBridges()
  }, [churchTenantId])

  const toggleBridge = async (bridgeId: string, enabled: boolean) => {
    try {
      await fetch("/api/bridges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bridgeId, enabled }),
      })
      fetchBridges()
    } catch (error) {
      console.error("[v0] Failed to toggle bridge:", error)
    }
  }

  const deleteBridge = async (bridgeId: string) => {
    if (!confirm("Are you sure you want to delete this bridge?")) return

    try {
      await fetch(`/api/bridges?bridgeId=${bridgeId}`, {
        method: "DELETE",
      })
      fetchBridges()
    } catch (error) {
      console.error("[v0] Failed to delete bridge:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Bridges</h2>
          <p className="text-muted-foreground">Sync messages between Slack and GroupMe</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bridge
        </Button>
      </div>

      {bridges.length === 0 ? (
        <Alert>
          <AlertDescription>
            No bridges configured yet. Create a bridge to sync messages between Slack and GroupMe.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {bridges.map((bridge) => (
            <Card key={bridge.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{bridge.name}</h3>
                    <Badge variant={bridge.enabled ? "default" : "secondary"}>
                      {bridge.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Slack:</span>
                    <span>{bridge.slack_channel_name}</span>
                    <ArrowLeftRight className="h-4 w-4 mx-2" />
                    <span className="font-medium">GroupMe:</span>
                    <span>{bridge.groupme_group_name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{bridge.sync_direction.replace("_", " → ")}</Badge>
                    {bridge.include_sender_name && <Badge variant="outline">Show sender names</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={bridge.enabled} onCheckedChange={(checked) => toggleBridge(bridge.id, checked)} />
                    <Label>Enabled</Label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteBridge(bridge.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateBridgeDialog
          churchTenantId={churchTenantId}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false)
            fetchBridges()
          }}
        />
      )}
    </div>
  )
}
