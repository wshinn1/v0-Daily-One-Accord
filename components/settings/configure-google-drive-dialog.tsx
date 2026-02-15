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
import { FolderOpen, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConfigureGoogleDriveDialogProps {
  currentUrl?: string
  churchTenantId: string
}

export function ConfigureGoogleDriveDialog({ currentUrl, churchTenantId }: ConfigureGoogleDriveDialogProps) {
  const [open, setOpen] = useState(false)
  const [googleDriveUrl, setGoogleDriveUrl] = useState(currentUrl || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!googleDriveUrl.trim()) {
      setError("Please enter a Google Drive folder URL")
      return
    }

    // Validate that it's a Google Drive URL
    if (!googleDriveUrl.includes("drive.google.com")) {
      setError("Please enter a valid Google Drive URL")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/church-tenant/update-google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          googleDriveUrl: googleDriveUrl.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update Google Drive URL")
      }

      setOpen(false)
      window.location.reload()
    } catch (err) {
      setError("Failed to save Google Drive URL. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="w-4 h-4 mr-2" />
          {currentUrl ? "Update" : "Configure"} Google Drive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Google Drive</DialogTitle>
          <DialogDescription>Set up your church's Google Drive folder for media assets</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription className="text-sm">
              <strong>How to get your Google Drive folder URL:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Open Google Drive and navigate to your church's folder</li>
                <li>Click the "Share" button and set sharing to "Anyone with the link can view"</li>
                <li>Copy the folder URL from your browser's address bar</li>
                <li>Paste it below</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="google-drive-url">Google Drive Folder URL</Label>
            <Input
              id="google-drive-url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
