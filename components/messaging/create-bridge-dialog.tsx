"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface CreateBridgeDialogProps {
  churchTenantId: string
  onClose: () => void
  onSuccess: () => void
}

export function CreateBridgeDialog({ churchTenantId, onClose, onSuccess }: CreateBridgeDialogProps) {
  const [name, setName] = useState("")
  const [slackChannelId, setSlackChannelId] = useState("")
  const [groupmeBotId, setGroupmeBotId] = useState("")
  const [syncDirection, setSyncDirection] = useState("bidirectional")
  const [includeSenderName, setIncludeSenderName] = useState(true)
  const [loading, setLoading] = useState(false)

  const [slackChannels, setSlackChannels] = useState<any[]>([])
  const [groupmeBots, setGroupmeBots] = useState<any[]>([])

  useEffect(() => {
    // Fetch available Slack channels and GroupMe bots
    const fetchData = async () => {
      try {
        const [slackRes, groupmeRes] = await Promise.all([
          fetch(`/api/slack/channels?churchTenantId=${churchTenantId}`),
          fetch(`/api/groupme/bots?churchTenantId=${churchTenantId}`),
        ])

        const slackData = await slackRes.json()
        const groupmeData = await groupmeRes.json()

        setSlackChannels(slackData.channels || [])
        setGroupmeBots(groupmeData.bots || [])
      } catch (error) {
        console.error("[v0] Failed to fetch channels/bots:", error)
      }
    }

    fetchData()
  }, [churchTenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slackChannel = slackChannels.find((c) => c.id === slackChannelId)
      const groupmeBot = groupmeBots.find((b) => b.id === groupmeBotId)

      const response = await fetch("/api/bridges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          name,
          slackChannelId,
          slackChannelName: slackChannel?.name,
          groupmeGroupId: groupmeBot?.group_id,
          groupmeGroupName: groupmeBot?.group_name,
          groupmeBotId,
          syncDirection,
          includeSenderName,
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("[v0] Failed to create bridge:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Message Bridge</DialogTitle>
          <DialogDescription>
            Connect a Slack channel with a GroupMe group to sync messages between them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bridge Name</Label>
            <Input
              id="name"
              placeholder="e.g., Main Announcements Bridge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slackChannel">Slack Channel</Label>
            <Select value={slackChannelId} onValueChange={setSlackChannelId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Slack channel" />
              </SelectTrigger>
              <SelectContent>
                {slackChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    #{channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupmeBot">GroupMe Group</Label>
            <Select value={groupmeBotId} onValueChange={setGroupmeBotId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select GroupMe group" />
              </SelectTrigger>
              <SelectContent>
                {groupmeBots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncDirection">Sync Direction</Label>
            <Select value={syncDirection} onValueChange={setSyncDirection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bidirectional">Bidirectional (Both ways)</SelectItem>
                <SelectItem value="slack_to_groupme">Slack → GroupMe only</SelectItem>
                <SelectItem value="groupme_to_slack">GroupMe → Slack only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeSender">Include sender names</Label>
            <Switch id="includeSender" checked={includeSenderName} onCheckedChange={setIncludeSenderName} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Bridge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
