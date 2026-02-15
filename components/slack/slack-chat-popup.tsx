"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlackChatPopupProps {
  workspaceUrl?: string
}

export function SlackChatPopup({ workspaceUrl }: SlackChatPopupProps) {
  if (!workspaceUrl) {
    return null
  }

  const handleOpenSlack = () => {
    const width = 800
    const height = 600
    const left = window.screen.width - width - 100
    const top = 100

    window.open(
      workspaceUrl,
      "slack-chat",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    )
  }

  return (
    <Button
      onClick={handleOpenSlack}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
      size="icon"
      title="Open Slack Chat"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  )
}
