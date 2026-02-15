"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, User } from "lucide-react"

interface Newsletter {
  id: string
  subject: string
  content: string
  sent_at: string | null
  created_by: { full_name: string }
  created_at: string
  newsletter_recipients: Array<{ id: string }>
}

interface ViewNewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newsletter: Newsletter
}

export function ViewNewsletterDialog({ open, onOpenChange, newsletter }: ViewNewsletterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{newsletter.subject}</DialogTitle>
            {newsletter.sent_at ? <Badge variant="default">Sent</Badge> : <Badge variant="secondary">Draft</Badge>}
          </div>
          <DialogDescription className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Created by {newsletter.created_by.full_name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(newsletter.created_at).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {newsletter.newsletter_recipients.length} recipients
            </div>
            {newsletter.sent_at && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Sent on {new Date(newsletter.sent_at).toLocaleString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Content</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{newsletter.content}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
