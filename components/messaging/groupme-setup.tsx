"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react"

interface GroupMeGroup {
  id: string
  name: string
  description: string
  image_url: string
  members_count: number
}

interface GroupMeSetupProps {
  churchTenantId: string
  onBotCreated?: () => void
}

export function GroupMeSetup({ churchTenantId, onBotCreated }: GroupMeSetupProps) {
  const [accessToken, setAccessToken] = useState("")
  const [groups, setGroups] = useState<GroupMeGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const fetchGroups = async () => {
    if (!accessToken) {
      setError("Please enter your GroupMe access token")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/groupme/groups", {
        headers: {
          "X-Access-Token": accessToken,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch groups")
      }

      setGroups(data.groups)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createBot = async () => {
    if (!selectedGroup) {
      setError("Please select a group")
      return
    }

    setLoading(true)
    setError("")

    try {
      const group = groups.find((g) => g.id === selectedGroup)

      const response = await fetch("/api/groupme/create-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          groupName: group?.name,
          accessToken,
          churchTenantId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bot")
      }

      setSuccess(true)
      onBotCreated?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>GroupMe bot created successfully! You can now create message bridges.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Connect GroupMe</h3>
            <p className="text-sm text-muted-foreground">
              Get your access token from{" "}
              <a
                href="https://dev.groupme.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                GroupMe Developers
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">GroupMe Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your GroupMe access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <Button onClick={fetchGroups} disabled={loading || !accessToken}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch Groups"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {groups.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="group">Select Group</Label>
              <select
                id="group"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Choose a group...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.members_count} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedGroup && (
            <Button onClick={createBot} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Bot"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
