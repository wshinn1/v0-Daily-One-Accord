"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FolderOpen, CheckCircle, ExternalLink, Copy, Settings } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function GoogleDriveSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const { toast } = useToast()

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    toast({
      title: "Copied to clipboard",
      description: "The URL has been copied to your clipboard",
    })
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const setupSteps = [
    {
      title: "Create or Open Your Google Drive Folder",
      description: "Go to Google Drive and create a new folder for your church media assets, or open an existing one.",
      action: (
        <Button variant="outline" asChild>
          <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Google Drive
          </a>
        </Button>
      ),
    },
    {
      title: "Set Folder Permissions",
      description:
        "Right-click the folder, select 'Share', and set permissions to 'Anyone with the link can view' or add specific church members.",
      tips: [
        "For public access: Choose 'Anyone with the link' → 'Viewer'",
        "For restricted access: Add specific email addresses of church members",
        "Recommended: Use 'Anyone with the link' for easier access",
      ],
    },
    {
      title: "Copy the Folder URL",
      description: "Click 'Copy link' in the share dialog. The URL should look like this:",
      example: "https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard("https://drive.google.com/drive/folders/YOUR_FOLDER_ID", 3)}
        >
          <Copy className="mr-2 h-4 w-4" />
          {copiedStep === 3 ? "Copied!" : "Copy Example"}
        </Button>
      ),
    },
    {
      title: "Configure in Settings",
      description: "Go to Settings and paste your Google Drive folder URL in the Media Assets section.",
      action: (
        <Button asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Go to Settings
          </Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Alert>
        <FolderOpen className="h-4 w-4" />
        <AlertTitle>Google Drive Integration</AlertTitle>
        <AlertDescription>
          Connect your church's Google Drive folder to easily share and access media files, presentations, graphics, and
          other resources with your team.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
          <CardDescription>Follow these steps to connect your Google Drive folder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {setupSteps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.tips && (
                  <ul className="space-y-1 mt-2">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {step.example && (
                  <div className="bg-muted p-3 rounded-lg font-mono text-xs break-all">{step.example}</div>
                )}
                {step.action && <div className="pt-2">{step.action}</div>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits of Google Drive Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Centralized Media Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Store all your church media files in one organized location
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Easy Team Access</h4>
                <p className="text-sm text-muted-foreground">
                  Share files with your entire team without email attachments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Real-time Sync</h4>
                <p className="text-sm text-muted-foreground">Changes in Google Drive appear instantly in the app</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Version History</h4>
                <p className="text-sm text-muted-foreground">
                  Google Drive automatically tracks file versions and changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Folder Structure</CardTitle>
          <CardDescription>Organize your media assets for easy access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm bg-muted p-4 rounded-lg">
            <div>📁 Church Media Assets</div>
            <div className="ml-4">📁 Graphics & Logos</div>
            <div className="ml-4">📁 Presentations</div>
            <div className="ml-4">📁 Service Backgrounds</div>
            <div className="ml-4">📁 Worship Lyrics</div>
            <div className="ml-4">📁 Event Flyers</div>
            <div className="ml-4">📁 Social Media</div>
            <div className="ml-4">📁 Videos</div>
            <div className="ml-4">📁 Audio Files</div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>
          If you encounter any issues setting up Google Drive, contact your system administrator or reach out to support
          for assistance.
        </AlertDescription>
      </Alert>
    </div>
  )
}
