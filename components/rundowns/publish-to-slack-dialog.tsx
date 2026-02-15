"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Send } from "lucide-react"

interface PublishToSlackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rundownId: string
  defaultChannel?: string
  onPublish: (channelId: string) => Promise<void>
}

export function PublishToSlackDialog({
  open,
  onOpenChange,
  rundownId,
  defaultChannel,
  onPublish,
}: PublishToSlackDialogProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchingChannels, setFetchingChannels] = useState(false)

  useEffect(() => {
    if (open) {
      fetchChannels()
    }
  }, [open])

  const fetchChannels = async () => {
    setFetchingChannels(true)
    try {
      const response = await fetch("/api/slack/channels")
      if (response.ok) {
        const data = await response.json()
        setChannels(data.channels || [])

        // Set default channel if available
        if (defaultChannel && data.channels) {
          const defaultChan = data.channels.find((c: any) => c.name === defaultChannel)
          if (defaultChan) {
            setSelectedChannel(defaultChan.id)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching channels:", error)
    } finally {
      setFetchingChannels(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedChannel) return

    setLoading(true)
    try {
      await onPublish(selectedChannel)
      onOpenChange(false)
    } catch (error) {
      console.error("Error publishing:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish to Slack</DialogTitle>
          <DialogDescription>Choose which Slack channel to publish this rundown to.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channel">Slack Channel</Label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel} disabled={fetchingChannels}>
              <SelectTrigger id="channel">
                <SelectValue placeholder={fetchingChannels ? "Loading channels..." : "Select a channel"} />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    #{channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultChannel && <p className="text-xs text-muted-foreground">Default channel: #{defaultChannel}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={loading || !selectedChannel}>
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
