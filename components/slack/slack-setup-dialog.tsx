"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { SlackSetupGuide } from "./slack-setup-guide"

export function SlackSetupDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onSetChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Setup Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slack Integration Setup</DialogTitle>
          <DialogDescription>Follow these steps to enable attendance tracking via Slack</DialogDescription>
        </DialogHeader>
        <SlackSetupGuide />
      </DialogContent>
    </Dialog>
  )
}
