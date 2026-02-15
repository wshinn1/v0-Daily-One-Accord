"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, User, Calendar, Trash2, Eye } from "lucide-react"
import { useState } from "react"
import { ViewNewsletterDialog } from "./view-newsletter-dialog"

interface Newsletter {
  id: string
  subject: string
  content: string
  sent_at: string | null
  created_by: { full_name: string }
  created_at: string
  newsletter_recipients: Array<{ id: string }>
}

interface NewsletterListProps {
  newsletters: Newsletter[]
  onDelete: (id: string) => void
}

export function NewsletterList({ newsletters, onDelete }: NewsletterListProps) {
  const [viewingNewsletter, setViewingNewsletter] = useState<Newsletter | null>(null)

  if (newsletters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
          <p className="text-sm text-muted-foreground">Create your first newsletter to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{newsletter.subject}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <User className="w-3 h-3" />
                    {newsletter.created_by.full_name}
                  </CardDescription>
                </div>
                {newsletter.sent_at ? <Badge variant="default">Sent</Badge> : <Badge variant="secondary">Draft</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(newsletter.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {newsletter.newsletter_recipients.length} recipients
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{newsletter.content}</p>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => setViewingNewsletter(newsletter)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(newsletter.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewingNewsletter && (
        <ViewNewsletterDialog
          open={!!viewingNewsletter}
          onOpenChange={(open) => !open && setViewingNewsletter(null)}
          newsletter={viewingNewsletter}
        />
      )}
    </>
  )
}
