"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SlackBotSetupProps {
  tenantId?: string
}

interface BotConfig {
  team_id: string
  bot_name: string
  created_at: string
}

export function SlackBotSetup({ tenantId }: SlackBotSetupProps) {
  const [bots, setBots] = useState<BotConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingBot, setEditingBot] = useState<BotConfig | null>(null)
  const [deletingBot, setDeletingBot] = useState<BotConfig | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    checkStatus()
  }, [tenantId])

  const checkStatus = async () => {
    setChecking(true)
    try {
      const url = tenantId ? `/api/slack/status?tenantId=${tenantId}` : "/api/slack/status"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBots(data.bots || [])
      }
    } catch (error) {
      console.error("[v0] Failed to check status:", error)
    } finally {
      setChecking(false)
    }
  }

  const openAddDialog = () => {
    setEditingBot(null)
    setTeamId("")
    setTeamName("")
    setSigningSecret("")
    setBotToken("")
    setShowDialog(true)
  }

  const openEditDialog = (bot: BotConfig) => {
    setEditingBot(bot)
    setTeamId(bot.team_id)
    setTeamName(bot.bot_name)
    setSigningSecret("")
    setBotToken("")
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!teamId || !signingSecret || !botToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Client: Starting bot save process", {
      teamId,
      teamName,
      tenantId,
      hasSigningSecret: !!signingSecret,
      hasBotToken: !!botToken,
    })

    setLoading(true)
    try {
      console.log("[v0] Client: Calling configure-bot API")
      const botResponse = await fetch("/api/slack/configure-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          signingSecret,
          botToken,
          botName: teamName || "Slack Bot",
          tenantId,
        }),
      })

      console.log("[v0] Client: configure-bot response status:", botResponse.status)

      if (!botResponse.ok) {
        const error = await botResponse.json()
        console.error("[v0] Client: configure-bot error:", error)
        throw new Error(error.error || "Failed to save bot configuration")
      }

      console.log("[v0] Client: Calling link-workspace API")
      const workspaceResponse = await fetch("/api/slack/link-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          teamName,
          tenantId,
          botToken,
          signingSecret,
        }),
      })

      console.log("[v0] Client: link-workspace response status:", workspaceResponse.status)

      if (!workspaceResponse.ok) {
        const error = await workspaceResponse.json()
        console.error("[v0] Client: link-workspace error:", error)
        throw new Error(error.error || "Failed to link workspace")
      }

      console.log("[v0] Client: Both APIs succeeded")

      toast({
        title: "Success",
        description: editingBot
          ? "Bot updated successfully!"
          : "Bot configured successfully! Try /attendance in Slack.",
      })

      setShowDialog(false)
      await checkStatus()
    } catch (error: any) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to configure Slack bot",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bot: BotConfig) => {
    if (!confirm(`Are you sure you want to delete the bot configuration for "${bot.bot_name}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/slack/delete-bot", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: bot.team_id,
          tenantId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete bot configuration")
      }

      toast({
        title: "Success",
        description: "Bot configuration deleted successfully",
      })

      await checkStatus()
    } catch (error: any) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete bot configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const [teamId, setTeamId] = useState("")
  const [teamName, setTeamName] = useState("")
  const [signingSecret, setSigningSecret] = useState("")
  const [botToken, setBotToken] = useState("")

  if (checking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slack Bot Configuration</CardTitle>
              <CardDescription>Configure Slack bots to enable /attendance and other integrations</CardDescription>
            </div>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Bot
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bots.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No Slack bots configured yet. Click "Add Bot" to get started.</AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {bots.length} bot{bots.length > 1 ? "s" : ""} configured. Try <code>/attendance</code> in Slack!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {bots.map((bot) => (
                  <div key={bot.team_id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{bot.bot_name}</p>
                      <p className="text-sm text-muted-foreground">Team ID: {bot.team_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(bot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(bot)} disabled={loading}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBot ? "Edit" : "Add"} Slack Bot</DialogTitle>
            <DialogDescription>Configure your Slack bot credentials to enable integrations</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-id">
                Slack Team ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="team-id"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="T09LPQJR1M0"
                disabled={!!editingBot}
              />
              <p className="text-sm text-muted-foreground">
                Run <code>/attendance</code> in Slack and check Vercel logs to find this
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-name">Bot Name (Optional)</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="My Church Bot"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signing-secret">
                Signing Secret <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signing-secret"
                type="password"
                value={signingSecret}
                onChange={(e) => setSigningSecret(e.target.value)}
                placeholder="Enter signing secret"
              />
              <p className="text-sm text-muted-foreground">
                Slack App → Basic Information → App Credentials → Signing Secret
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bot-token">
                Bot Token <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bot-token"
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="xoxb-..."
              />
              <p className="text-sm text-muted-foreground">Slack App → OAuth & Permissions → Bot User OAuth Token</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !teamId || !signingSecret || !botToken}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
