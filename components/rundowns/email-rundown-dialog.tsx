"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

interface EmailRundownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rundownId: string
  rundownTitle: string
}

export function EmailRundownDialog({ open, onOpenChange, rundownId, rundownTitle }: EmailRundownDialogProps) {
  const [recipients, setRecipients] = useState("")
  const [subject, setSubject] = useState(`Event Rundown: ${rundownTitle}`)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipients) {
      toast({
        title: "Missing recipients",
        description: "Please enter at least one email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/rundowns/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rundownId,
          recipients: recipients.split(",").map((email) => email.trim()),
          subject,
          message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")

      toast({
        title: "Email sent",
        description: "The rundown has been emailed successfully.",
      })

      onOpenChange(false)
      setRecipients("")
      setMessage("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Email Rundown</DialogTitle>
            <DialogDescription>Send this rundown via email to your team members</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients *</Label>
              <Input
                id="recipients"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Event Rundown: Sunday Service"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to include with the rundown..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
