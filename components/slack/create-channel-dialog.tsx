"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CreateChannelDialogProps {
  churchTenantId: string
  onChannelCreated: () => void
}

export function CreateChannelDialog({ churchTenantId, onChannelCreated }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false)
  const [channelName, setChannelName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [missingScopes, setMissingScopes] = useState<{ needed: string; provided: string } | null>(null)
  const { toast } = useToast()

  async function handleCreate() {
    if (!channelName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a channel name",
        variant: "destructive",
      })
      return
    }

    // Validate channel name format (lowercase, no spaces, hyphens/underscores allowed)
    const validName = channelName.toLowerCase().replace(/[^a-z0-9-_]/g, "-")
    if (validName !== channelName) {
      toast({
        title: "Invalid channel name",
        description: "Channel names must be lowercase with no spaces. Using: " + validName,
      })
      setChannelName(validName)
      return
    }

    setCreating(true)
    setMissingScopes(null)

    try {
      const response = await fetch("/api/slack/channels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: churchTenantId,
          channelName: validName,
          isPrivate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "missing_scope" && data.needed && data.provided) {
          setMissingScopes({
            needed: data.needed,
            provided: data.provided,
          })
          return
        }
        throw new Error(data.error || "Failed to create channel")
      }

      toast({
        title: "Success",
        description: `Channel #${data.channel.name} created successfully! Look for it in your Slack app's channel list or search for "${data.channel.name}" to join it.`,
        duration: 8000,
      })

      setOpen(false)
      setChannelName("")
      setIsPrivate(false)
      onChannelCreated()
    } catch (error: any) {
      console.error("[v0] Error creating channel:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create channel",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Slack Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {missingScopes && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Slack Permissions</AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <p>Your Slack bot doesn't have permission to create channels.</p>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Required scopes:</p>
                  <code className="block bg-destructive/10 p-2 rounded text-xs">{missingScopes.needed}</code>
                  <p className="font-semibold mt-2">Current scopes:</p>
                  <code className="block bg-destructive/10 p-2 rounded text-xs">{missingScopes.provided}</code>
                </div>
                <div className="space-y-2 text-sm mt-3">
                  <p className="font-semibold">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to https://api.slack.com/apps</li>
                    <li>Select your Slack app</li>
                    <li>Click "OAuth & Permissions"</li>
                    <li>
                      Add these Bot Token Scopes: <strong>channels:write</strong> and <strong>groups:write</strong>
                    </li>
                    <li>Click "Reinstall to Workspace" at the top</li>
                    <li>Copy the new Bot User OAuth Token</li>
                    <li>Update your Slack integration with the new token</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name</Label>
            <Input
              id="channel-name"
              placeholder="general-announcements"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value.toLowerCase())}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private-channel">Private Channel</Label>
              <p className="text-xs text-muted-foreground">Only invited members can see this channel</p>
            </div>
            <Switch id="private-channel" checked={isPrivate} onCheckedChange={setIsPrivate} disabled={creating} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Channel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
