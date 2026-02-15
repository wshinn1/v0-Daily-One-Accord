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
import { Key, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConfigureGoogleDriveApiDialogProps {
  currentApiKey?: string
  churchTenantId: string
}

export function ConfigureGoogleDriveApiDialog({ currentApiKey, churchTenantId }: ConfigureGoogleDriveApiDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState(currentApiKey || "")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    try {
      console.log("[v0] Saving Google Drive API key...")
      console.log("[v0] Church Tenant ID:", churchTenantId)
      console.log("[v0] API Key length:", apiKey.trim().length)

      const response = await fetch("/api/church-tenant/update-google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          apiKey: apiKey.trim(),
        }),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to save API key")
      }

      alert("Google Drive API key saved successfully!")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error saving Google Drive API key:", error)
      alert(`Failed to save API key: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="w-4 h-4 mr-2" />
          {currentApiKey ? "Update" : "Configure"} API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Google Drive API Key</DialogTitle>
          <DialogDescription>Add your Google Drive API key to enable file browsing and previews</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google Drive API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              How to create a Google Drive API Key
            </h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>
                Go to{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Create a new project or select an existing one</li>
              <li>
                Go to <strong>APIs & Services</strong> → <strong>Library</strong>
              </li>
              <li>
                Search for <strong>"Google Drive API"</strong> and enable it
              </li>
              <li>
                Go to <strong>APIs & Services</strong> → <strong>Credentials</strong>
              </li>
              <li>
                Click <strong>Create Credentials</strong> → <strong>API Key</strong>
              </li>
              <li>
                (Recommended) Click <strong>Restrict Key</strong> and limit to Google Drive API
              </li>
              <li>Copy the API key and paste it above</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !apiKey.trim()}>
            {loading ? "Saving..." : "Save API Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
