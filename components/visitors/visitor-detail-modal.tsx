"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Calendar, User, Clock } from "lucide-react"
import { VisitorComments } from "./visitor-comments"
import { VisitorAttachments } from "./visitor-attachments"
import { LabelSelector } from "./label-selector"
import { CustomFieldsEditor } from "./custom-fields-editor"
import { VisitorTimeTracking } from "./visitor-time-tracking"
import { VisitorChecklist } from "./visitor-checklist"

interface Label {
  id: string
  name: string
  color: string
}

interface Visitor {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: "new" | "follow_up" | "engaged"
  notes: string | null
  first_visit_date: string | null
  assigned_to: { id: string; full_name: string } | null
  due_date: string | null
  labels?: Label[]
}

interface VisitorDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitor: Visitor
  currentUserId: string
  onVisitorUpdate?: (visitor: Visitor) => void
}

export function VisitorDetailModal({
  open,
  onOpenChange,
  visitor,
  currentUserId,
  onVisitorUpdate,
}: VisitorDetailModalProps) {
  const [visitorLabels, setVisitorLabels] = useState<Label[]>(visitor.labels || [])

  useEffect(() => {
    if (open) {
      loadVisitorLabels()
    }
  }, [open, visitor.id])

  const loadVisitorLabels = async () => {
    try {
      const response = await fetch(`/api/visitors/${visitor.id}/labels`)
      const data = await response.json()
      if (response.ok) {
        setVisitorLabels(data.labels || [])
      }
    } catch (error) {
      console.error("[v0] Error loading visitor labels:", error)
    }
  }

  const handleLabelsChange = (labels: Label[]) => {
    setVisitorLabels(labels)
    if (onVisitorUpdate) {
      onVisitorUpdate({ ...visitor, labels })
    }
  }

  const handleCommentAdded = () => {
    if (onVisitorUpdate) {
      onVisitorUpdate(visitor)
    }
  }

  const statusLabels = {
    new: "New Visitor",
    follow_up: "Needs Follow Up",
    engaged: "Engaged",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{visitor.full_name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {statusLabels[visitor.status]}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Files</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Labels</h4>
                <LabelSelector
                  visitorId={visitor.id}
                  selectedLabels={visitorLabels}
                  onLabelsChange={handleLabelsChange}
                />
              </div>

              {visitor.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{visitor.email}</span>
                </div>
              )}

              {visitor.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{visitor.phone}</span>
                </div>
              )}

              {visitor.first_visit_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    First visit: {new Date(visitor.first_visit_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {visitor.due_date && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Follow-up due: {new Date(visitor.due_date).toLocaleDateString()}</span>
                </div>
              )}

              {visitor.assigned_to && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Assigned to: {visitor.assigned_to.full_name}</span>
                </div>
              )}
            </div>

            {visitor.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visitor.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklist" className="mt-4">
            <VisitorChecklist visitorId={visitor.id} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <CustomFieldsEditor visitorId={visitor.id} />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <VisitorComments visitorId={visitor.id} currentUserId={currentUserId} onCommentAdded={handleCommentAdded} />
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <VisitorAttachments visitorId={visitor.id} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="time" className="mt-4">
            <VisitorTimeTracking visitorId={visitor.id} currentUserId={currentUserId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
