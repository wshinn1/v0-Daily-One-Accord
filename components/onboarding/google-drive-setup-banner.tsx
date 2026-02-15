"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FolderOpen, X } from "lucide-react"
import Link from "next/link"

interface GoogleDriveSetupBannerProps {
  tenantId: string
  googleDriveConfigured: boolean
}

export function GoogleDriveSetupBanner({ tenantId, googleDriveConfigured }: GoogleDriveSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (googleDriveConfigured || dismissed) {
    return null
  }

  return (
    <Alert className="relative">
      <FolderOpen className="h-4 w-4" />
      <AlertTitle>Set up Media Assets</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Connect your Google Drive folder to share media files with your team.</span>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/media-assets">Setup Now</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
