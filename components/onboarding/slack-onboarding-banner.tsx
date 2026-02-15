"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { MessageSquare, X, Download, ExternalLink } from "lucide-react"

interface SlackOnboardingBannerProps {
  userId: string
  tenantId: string
  slackConnected: boolean
  workspaceUrl?: string
}

export function SlackOnboardingBanner({ userId, tenantId, slackConnected, workspaceUrl }: SlackOnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const dismissedKey = `slack-onboarding-dismissed-${userId}`
    const wasDismissed = localStorage.getItem(dismissedKey)
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [userId])

  const handleDismiss = async () => {
    setLoading(true)
    try {
      const dismissedKey = `slack-onboarding-dismissed-${userId}`
      localStorage.setItem(dismissedKey, "true")

      await fetch("/api/users/slack-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tenantId }),
      })

      setDismissed(true)
    } catch (error) {
      console.error("Error dismissing banner:", error)
    } finally {
      setLoading(false)
    }
  }

  if (slackConnected || dismissed) {
    return null
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <div className="flex items-start justify-between flex-1">
        <div className="flex-1">
          <AlertTitle className="text-blue-900 dark:text-blue-100">Get Started with Slack</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 mt-1">
            Stay connected with your church community! Download the Slack app and join your church's workspace to
            receive real-time notifications about events, attendance updates, and important announcements.
          </AlertDescription>
          <div className="flex gap-2 mt-3 flex-wrap">
            <a href="https://slack.com/downloads" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download Slack
              </Button>
            </a>
            {workspaceUrl && (
              <a href={workspaceUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="border-blue-300 bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Workspace
                </Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={handleDismiss} disabled={loading}>
              {loading ? "Dismissing..." : "Maybe Later"}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={loading}
          className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Alert>
  )
}
