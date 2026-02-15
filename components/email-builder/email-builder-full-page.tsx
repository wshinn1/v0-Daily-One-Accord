"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailBuilder } from "./email-builder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EmailBuilderFullPageProps {
  churchTenantId: string
  userId: string
  initialTemplate?: any
}

export function EmailBuilderFullPage({ churchTenantId, userId, initialTemplate }: EmailBuilderFullPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [templateName, setTemplateName] = useState(initialTemplate?.name || "")
  const [templateDescription, setTemplateDescription] = useState(initialTemplate?.description || "")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [pendingBlocks, setPendingBlocks] = useState<any>(null)
  const [pendingHtml, setPendingHtml] = useState<string>("")

  const handleSave = (blocks: any[], html: string) => {
    setPendingBlocks(blocks)
    setPendingHtml(html)
    setShowSaveDialog(true)
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
        method: initialTemplate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialTemplate?.id,
          churchTenantId,
          name: templateName,
          description: templateDescription,
          blocks: pendingBlocks,
        }),
      })

      if (!response.ok) throw new Error("Failed to save template")

      toast({
        title: "Template saved",
        description: "Your email template has been saved successfully",
      })

      setShowSaveDialog(false)
      router.push("/dashboard/newsletter")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/newsletter")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletters
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Email Builder</h1>
            <p className="text-sm text-muted-foreground">Build beautiful emails with drag-and-drop blocks</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <EmailBuilder initialBlocks={initialTemplate?.blocks || []} onSave={handleSave} />
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
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
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
