"use client"

import { SlackBotTokenSetup } from "@/components/slack/slack-bot-token-setup"

interface ConfigureSlackChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: {
    id: string
    name: string
    slack_oauth_configured?: boolean
  }
}

export function ConfigureSlackChatDialog({ open, onOpenChange, church }: ConfigureSlackChatDialogProps) {
  return (
    <>
      {open && (
        <SlackBotTokenSetup
          churchId={church.id}
          churchName={church.name}
          isConfigured={!!church.slack_oauth_configured}
          onClose={() => onOpenChange(false)}
        />
      )}
    </>
  )
}
