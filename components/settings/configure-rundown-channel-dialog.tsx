"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConfigureRundownChannelDialogProps {
  currentChannelName?: string
  churchTenantId: string
}

export function ConfigureRundownChannelDialog({
  currentChannelName,
  churchTenantId,
}: ConfigureRundownChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [channelName, setChannelName] = useState(currentChannelName || "event-rundowns")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/church-tenant/update-rundown-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          channelName: channelName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update rundown channel")
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating rundown channel:", error)
      alert("Failed to update rundown channel. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Rundown Channel</DialogTitle>
          <DialogDescription>Set the default Slack channel where event rundowns will be published.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelName">Channel Name</Label>
            <Input
              id="channelName"
              placeholder="event-rundowns"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the Slack channel name without the # symbol. The channel will be created if it doesn't exist.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !channelName.trim()}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
