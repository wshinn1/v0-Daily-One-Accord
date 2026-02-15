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
import { useToast } from "@/hooks/use-toast"

interface ConfigureBotDialogProps {
  teamId: string
  teamName: string
  currentSigningSecret?: string
  currentBotToken?: string
}

export function ConfigureBotDialog({
  teamId,
  teamName,
  currentSigningSecret,
  currentBotToken,
}: ConfigureBotDialogProps) {
  const [open, setOpen] = useState(false)
  const [signingSecret, setSigningSecret] = useState(currentSigningSecret || "")
  const [botToken, setBotToken] = useState(currentBotToken || "")
  const [appId, setAppId] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/slack/configure-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          signingSecret,
          botToken,
          appId,
        }),
      })

      if (!response.ok) throw new Error("Failed to save configuration")

      toast({
        title: "Success",
        description: "Bot configuration saved successfully",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bot configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Slack Bot</DialogTitle>
          <DialogDescription>
            Configure the bot credentials for {teamName}. Get these from your Slack app settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="signing-secret">Signing Secret</Label>
            <Input
              id="signing-secret"
              type="password"
              placeholder="Enter signing secret from Slack app"
              value={signingSecret}
              onChange={(e) => setSigningSecret(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Found in: Basic Information → App Credentials → Signing Secret
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bot-token">Bot Token</Label>
            <Input
              id="bot-token"
              type="password"
              placeholder="xoxb-..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Found in: OAuth & Permissions → Bot User OAuth Token</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-id">App ID (Optional)</Label>
            <Input id="app-id" placeholder="A1234567890" value={appId} onChange={(e) => setAppId(e.target.value)} />
            <p className="text-sm text-muted-foreground">Found in: Basic Information → App ID</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !signingSecret || !botToken}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
