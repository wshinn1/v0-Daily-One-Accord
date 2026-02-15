"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"

interface SlackSetupBannerProps {
  tenantId: string
  slackConfigured: boolean
}

export function SlackSetupBanner({ tenantId, slackConfigured }: SlackSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this banner for this tenant
    const dismissedBanners = localStorage.getItem("dismissedSlackBanner")
    if (dismissedBanners) {
      const dismissed = JSON.parse(dismissedBanners)
      if (dismissed[tenantId]) {
        setDismissed(true)
      }
    }
  }, [tenantId])

  const handleDismiss = () => {
    // Save dismissal to localStorage
    const dismissedBanners = localStorage.getItem("dismissedSlackBanner")
    const dismissed = dismissedBanners ? JSON.parse(dismissedBanners) : {}
    dismissed[tenantId] = true
    localStorage.setItem("dismissedSlackBanner", JSON.stringify(dismissed))
    setDismissed(true)
  }

  // Don't show if Slack is already configured or if user dismissed it
  if (slackConfigured || dismissed) {
    return null
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="font-medium text-blue-900 dark:text-blue-100">Stay connected with your church community!</p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Ask your church admin to set up Slack integration for real-time messaging and collaboration. Once
            configured, you'll be able to chat with your team directly from this dashboard.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
