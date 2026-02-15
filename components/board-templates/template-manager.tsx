"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"

interface BoardTemplate {
  id: string
  name: string
  description: string | null
  is_public: boolean
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<BoardTemplate[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const response = await fetch("/api/board-templates")
    const data = await response.json()
    setTemplates(data.templates || [])
  }

  const createTemplate = async () => {
    if (!name) return

    // Get current board configuration (simplified - would need to gather actual config)
    const templateData = {
      statuses: ["new", "follow_up", "engaged"],
      // Add more configuration as needed
    }

    await fetch("/api/board-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        template_data: templateData,
      }),
    })

    setName("")
    setDescription("")
    setIsOpen(false)
    fetchTemplates()
  }

  const applyTemplate = async (templateId: string) => {
    const response = await fetch(`/api/board-templates/${templateId}/apply`, {
      method: "POST",
    })
    const data = await response.json()

    if (data.success) {
      alert("Template applied successfully! Refresh the page to see changes.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Board Templates</h2>
          <p className="text-muted-foreground">Save and reuse board configurations</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Board Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={createTemplate} className="w-full">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{template.description || "No description"}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => applyTemplate(template.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
