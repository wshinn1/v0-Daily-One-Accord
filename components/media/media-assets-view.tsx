"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FolderOpen, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleDriveSetupGuide } from "./google-drive-setup-guide"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleDriveFileBrowser } from "./google-drive-file-browser"

interface MediaAssetsViewProps {
  googleDriveUrl?: string | null
}

export function MediaAssetsView({ googleDriveUrl }: MediaAssetsViewProps) {
  // Convert Google Drive folder URL to embed URL
  const getEmbedUrl = (url: string) => {
    // Extract folder ID from various Google Drive URL formats
    const folderIdMatch = url.match(/folders\/([a-zA-Z0-9-_]+)/)
    if (folderIdMatch) {
      return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#grid`
    }
    return url
  }

  const getFolderId = (url: string) => {
    const folderIdMatch = url.match(/folders\/([a-zA-Z0-9-_]+)/)
    return folderIdMatch ? folderIdMatch[1] : null
  }

  if (!googleDriveUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Media Assets</h1>
          <p className="text-muted-foreground mt-2">Access your church's shared media files and folders</p>
        </div>

        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertDescription>
            Media Assets haven't been configured yet. Follow the setup guide below to connect your Google Drive folder.
          </AlertDescription>
        </Alert>

        <GoogleDriveSetupGuide />
      </div>
    )
  }

  const embedUrl = getEmbedUrl(googleDriveUrl)
  const folderId = getFolderId(googleDriveUrl)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Assets</h1>
          <p className="text-muted-foreground mt-2">Access your church's shared media files and folders</p>
        </div>
        <Button variant="outline" asChild>
          <a href={googleDriveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Google Drive
          </a>
        </Button>
      </div>

      <Tabs defaultValue="browser" className="w-full">
        <TabsList>
          <TabsTrigger value="browser">File Browser</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="space-y-4">
          {folderId ? (
            <GoogleDriveFileBrowser folderId={folderId} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  Unable to extract folder ID from the Google Drive URL. Please check your configuration.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="guide">
          <GoogleDriveSetupGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}
