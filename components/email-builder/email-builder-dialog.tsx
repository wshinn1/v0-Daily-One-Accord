"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmailBuilder } from "./email-builder"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface EmailBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  churchTenantId: string
  onSaveTemplate?: (template: any) => void
}

export function EmailBuilderDialog({ open, onOpenChange, churchTenantId, onSaveTemplate }: EmailBuilderDialogProps) {
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [pendingBlocks, setPendingBlocks] = useState<any>(null)
  const [pendingHtml, setPendingHtml] = useState<string>("")
  const { toast } = useToast()

  const handleSave = (blocks: any[], html: string) => {
    setPendingBlocks(blocks)
    setPendingHtml(html)
    setShowNameDialog(true)
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId,
          name: templateName,
          description: templateDescription,
          blocks: pendingBlocks,
        }),
      })

      if (!response.ok) throw new Error("Failed to save template")

      const data = await response.json()

      toast({
        title: "Template saved",
        description: "Your email template has been saved successfully",
      })

      onSaveTemplate?.(data)
      setTemplateName("")
      setTemplateDescription("")
      setShowNameDialog(false)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-6 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Email Builder</DialogTitle>
            <DialogDescription>Build beautiful emails with drag-and-drop blocks</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 mt-4">
            <EmailBuilder onSave={handleSave} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>Give your email template a name and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Weekly Newsletter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Input
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this template"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowNameDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="flex-1">
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
