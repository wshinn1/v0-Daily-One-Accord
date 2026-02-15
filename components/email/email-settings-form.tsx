"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Save, Eye, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { put } from "@vercel/blob"
import { EmailTemplateEditor } from "./email-template-editor"

interface EmailSettingsFormProps {
  churchTenant: any
}

export function EmailSettingsForm({ churchTenant }: EmailSettingsFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(churchTenant.logo_url || "")
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  const [branding, setBranding] = useState({
    logo_url: churchTenant.logo_url || "",
    primary_color: churchTenant.primary_color || "#3b82f6",
    secondary_color: churchTenant.secondary_color || "#8b5cf6",
    email_header_text: churchTenant.name || "",
    email_footer_text: `© ${new Date().getFullYear()} ${churchTenant.name}. All rights reserved.`,
    email_signature: `Best regards,\nThe ${churchTenant.name} Team`,
  })

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/email-templates?church_tenant_id=${churchTenant.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("[v0] Error loading templates:", error)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSaveBranding = async () => {
    setLoading(true)
    try {
      let logoUrl = branding.logo_url

      // Upload logo if new file selected
      if (logoFile) {
        const blob = await put(`church-logos/${churchTenant.id}/${logoFile.name}`, logoFile, {
          access: "public",
        })
        logoUrl = blob.url
      }

      // Update church tenant with branding
      const response = await fetch(`/api/church-tenants/${churchTenant.id}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...branding,
          logo_url: logoUrl,
        }),
      })

      if (!response.ok) throw new Error("Failed to save branding")

      toast({
        title: "Branding saved",
        description: "Your email branding has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setShowTemplateEditor(true)
  }

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template)
    setShowTemplateEditor(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete template")

      toast({
        title: "Template deleted",
        description: "The email template has been deleted.",
      })

      loadTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      })
    }
  }

  const handleTemplateSaved = () => {
    setShowTemplateEditor(false)
    setSelectedTemplate(null)
    loadTemplates()
  }

  return (
    <Tabs defaultValue="branding" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="templates">Email Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="branding" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Church Branding</CardTitle>
            <CardDescription>Customize how your church appears in all outgoing emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Church Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-32 h-32 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Church logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">Recommended: 400x400px, PNG or JPG</p>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={branding.primary_color}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Email Header */}
            <div className="space-y-2">
              <Label htmlFor="header-text">Email Header Text</Label>
              <Input
                id="header-text"
                value={branding.email_header_text}
                onChange={(e) => setBranding({ ...branding, email_header_text: e.target.value })}
                placeholder="Your Church Name"
              />
            </div>

            {/* Email Footer */}
            <div className="space-y-2">
              <Label htmlFor="footer-text">Email Footer Text</Label>
              <Textarea
                id="footer-text"
                value={branding.email_footer_text}
                onChange={(e) => setBranding({ ...branding, email_footer_text: e.target.value })}
                placeholder="© 2025 Your Church. All rights reserved."
                rows={3}
              />
            </div>

            {/* Email Signature */}
            <div className="space-y-2">
              <Label htmlFor="signature">Email Signature</Label>
              <Textarea
                id="signature"
                value={branding.email_signature}
                onChange={(e) => setBranding({ ...branding, email_signature: e.target.value })}
                placeholder="Best regards,&#10;The Church Team"
                rows={4}
              />
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Email Preview</h3>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                {/* Header */}
                <div
                  className="p-4 rounded-t-lg text-white text-center"
                  style={{ backgroundColor: branding.primary_color }}
                >
                  {logoPreview && (
                    <img src={logoPreview || "/placeholder.svg"} alt="Logo" className="h-12 mx-auto mb-2" />
                  )}
                  <h2 className="text-xl font-bold">{branding.email_header_text}</h2>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-gray-700 mb-4">
                    This is a preview of how your emails will look with your branding.
                  </p>
                  <div className="whitespace-pre-wrap text-sm text-gray-600">{branding.email_signature}</div>
                </div>

                {/* Footer */}
                <div
                  className="p-4 rounded-b-lg text-center text-sm"
                  style={{
                    backgroundColor: branding.secondary_color + "20",
                    color: branding.secondary_color,
                  }}
                >
                  {branding.email_footer_text}
                </div>
              </div>
            </div>

            <Button onClick={handleSaveBranding} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Branding"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates">
        {showTemplateEditor ? (
          <EmailTemplateEditor
            template={selectedTemplate}
            churchTenant={churchTenant}
            onSave={handleTemplateSaved}
            onCancel={() => {
              setShowTemplateEditor(false)
              setSelectedTemplate(null)
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Customize automated email templates for your church</CardDescription>
                </div>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No email templates yet. Create your first template to get started.
                  </p>
                  <Button onClick={handleCreateTemplate} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          {template.is_default && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              Default Template
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!template.is_default && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
