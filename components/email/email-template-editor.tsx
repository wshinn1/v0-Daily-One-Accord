"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailTemplateEditorProps {
  template: any
  churchTenant: any
  onSave: () => void
  onCancel: () => void
}

const TEMPLATE_TYPES = [
  { value: "welcome", label: "Welcome Email" },
  { value: "event_confirmation", label: "Event Confirmation" },
  { value: "newsletter", label: "Newsletter" },
  { value: "notification", label: "Notification" },
  { value: "reminder", label: "Reminder" },
  { value: "custom", label: "Custom" },
]

const TEMPLATE_VARIABLES = [
  { var: "{{church_name}}", desc: "Church name" },
  { var: "{{user_name}}", desc: "Recipient's name" },
  { var: "{{user_email}}", desc: "Recipient's email" },
  { var: "{{event_name}}", desc: "Event name" },
  { var: "{{event_date}}", desc: "Event date" },
  { var: "{{event_time}}", desc: "Event time" },
  { var: "{{event_location}}", desc: "Event location" },
  { var: "{{confirmation_link}}", desc: "Confirmation link" },
  { var: "{{unsubscribe_link}}", desc: "Unsubscribe link" },
]

export function EmailTemplateEditor({ template, churchTenant, onSave, onCancel }: EmailTemplateEditorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    template_type: template?.template_type || "custom",
    subject: template?.subject || "",
    body: template?.body || "",
    is_default: template?.is_default || false,
  })

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = template ? `/api/email-templates/${template.id}` : "/api/email-templates"

      const response = await fetch(url, {
        method: template ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          church_tenant_id: churchTenant.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to save template")

      toast({
        title: "Template saved",
        description: "Your email template has been saved successfully.",
      })

      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      body: formData.body + " " + variable,
    })
  }

  const renderPreview = () => {
    let preview = formData.body
    preview = preview.replace(/{{church_name}}/g, churchTenant.name)
    preview = preview.replace(/{{user_name}}/g, "John Doe")
    preview = preview.replace(/{{user_email}}/g, "john@example.com")
    preview = preview.replace(/{{event_name}}/g, "Sunday Service")
    preview = preview.replace(/{{event_date}}/g, "January 15, 2025")
    preview = preview.replace(/{{event_time}}/g, "10:00 AM")
    preview = preview.replace(/{{event_location}}/g, "Main Sanctuary")
    return preview
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{template ? "Edit Template" : "Create New Template"}</CardTitle>
            <CardDescription>Design automated email templates for your church</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Template Type</Label>
            <Select
              value={formData.template_type}
              onValueChange={(value) => setFormData({ ...formData, template_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this template"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Welcome to {{church_name}}!"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Email Body *</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
          <Textarea
            id="body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Write your email content here. Use variables like {{user_name}} to personalize."
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-semibold mb-3 text-sm">Available Variables</h4>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_VARIABLES.map((v) => (
              <Button
                key={v.var}
                variant="outline"
                size="sm"
                onClick={() => insertVariable(v.var)}
                className="justify-start text-xs"
              >
                <code className="mr-2">{v.var}</code>
                <span className="text-muted-foreground">{v.desc}</span>
              </Button>
            ))}
          </div>
        </div>

        {showPreview && (
          <div className="border rounded-lg p-6 bg-white">
            <h4 className="font-semibold mb-4">Preview</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Subject:</p>
                <p className="font-semibold">{formData.subject.replace(/{{church_name}}/g, churchTenant.name)}</p>
              </div>
              <div className="border-t pt-4">
                <div className="whitespace-pre-wrap">{renderPreview()}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Template"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
