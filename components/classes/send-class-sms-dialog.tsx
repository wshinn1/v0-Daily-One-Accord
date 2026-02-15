"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SendClassSMSDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollments: any[]
  classData: any
  churchTenantId: string
}

export function SendClassSMSDialog({
  open,
  onOpenChange,
  enrollments,
  classData,
  churchTenantId,
}: SendClassSMSDialogProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null)

  const handleSend = async () => {
    setSending(true)
    setResults(null)

    let success = 0
    let failed = 0

    for (const enrollment of enrollments) {
      try {
        const response = await fetch("/api/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            churchTenantId,
            to: enrollment.user.phone,
            message,
            recipientType: "class_enrollment",
            recipientId: enrollment.id,
          }),
        })

        if (response.ok) {
          success++
        } else {
          failed++
        }
      } catch (error) {
        console.error("[v0] Error sending SMS:", error)
        failed++
      }
    }

    setResults({ success, failed })
    setSending(false)

    if (failed === 0) {
      setTimeout(() => {
        onOpenChange(false)
        setMessage("")
        setResults(null)
      }, 2000)
    }
  }

  const characterCount = message.length
  const messageCount = Math.ceil(characterCount / 160)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send SMS to Class Students
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will send an SMS to {enrollments.length} student{enrollments.length !== 1 ? "s" : ""} enrolled in{" "}
              {classData.name}.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={sending}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {characterCount} characters ({messageCount} message{messageCount !== 1 ? "s" : ""})
              </span>
              <span>160 characters per SMS</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recipients ({enrollments.length})</Label>
            <ScrollArea className="h-32 border rounded-lg p-2">
              <div className="space-y-1">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="text-sm flex items-center justify-between py-1">
                    <span>{enrollment.user.full_name}</span>
                    <span className="text-muted-foreground">{enrollment.user.phone}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {results && (
            <Alert variant={results.failed === 0 ? "default" : "destructive"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {results.success > 0 &&
                  `Successfully sent to ${results.success} student${results.success !== 1 ? "s" : ""}. `}
                {results.failed > 0 && `Failed to send to ${results.failed} student${results.failed !== 1 ? "s" : ""}.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim() || sending || enrollments.length === 0}>
            {sending ? "Sending..." : `Send to ${enrollments.length} Student${enrollments.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
