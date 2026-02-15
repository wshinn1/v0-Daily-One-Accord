"use client"

import type React from "react"

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
import { Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LinkSlackWorkspaceDialog() {
  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState("")
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/slack/link-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, teamName }),
      })

      if (!response.ok) throw new Error("Failed to link workspace")

      toast({
        title: "Success",
        description: "Slack workspace linked successfully",
      })

      setOpen(false)
      setTeamId("")
      setTeamName("")
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link Slack workspace",
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
          <Link2 className="mr-2 h-4 w-4" />
          Link Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Link Slack Workspace</DialogTitle>
            <DialogDescription>
              Connect your Slack workspace to enable attendance tracking via Slack commands.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teamId">Slack Team ID</Label>
              <Input
                id="teamId"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="T01234567"
                required
              />
              <p className="text-sm text-muted-foreground">
                Find this in your Slack app settings under "Basic Information"
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamName">Workspace Name (optional)</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="My Church Workspace"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !teamId}>
              {loading ? "Linking..." : "Link Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
