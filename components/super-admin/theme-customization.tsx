"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { Upload, Palette, Type, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ThemeCustomizationProps {
  tenantId: string
  currentTheme?: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    accent_color?: string
    background_color?: string
    text_color?: string
    heading_font?: string
    body_font?: string
    font_size_base?: string
    font_size_heading?: string
  }
}

export function ThemeCustomization({ tenantId, currentTheme }: ThemeCustomizationProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentTheme?.logo_url || null)

  const [theme, setTheme] = useState({
    primary_color: currentTheme?.primary_color || "#3b82f6",
    secondary_color: currentTheme?.secondary_color || "#8b5cf6",
    accent_color: currentTheme?.accent_color || "#10b981",
    background_color: currentTheme?.background_color || "#ffffff",
    text_color: currentTheme?.text_color || "#1f2937",
    heading_font: currentTheme?.heading_font || "Inter",
    body_font: currentTheme?.body_font || "Inter",
    font_size_base: currentTheme?.font_size_base || "16px",
    font_size_heading: currentTheme?.font_size_heading || "32px",
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let logoUrl = currentTheme?.logo_url

      // Upload logo if a new file was selected
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadResponse = await fetch("/api/upload-logo", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload logo")
        }

        const { url } = await uploadResponse.json()
        logoUrl = url
      }

      // Update theme in database
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { error } = await supabase
        .from("church_tenants")
        .update({
          logo_url: logoUrl,
          ...theme,
        })
        .eq("id", tenantId)

      if (error) throw error

      toast({
        title: "Theme updated",
        description: "Your theme customization has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving theme:", error)
      toast({
        title: "Error",
        description: "Failed to save theme customization. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo
          </CardTitle>
          <CardDescription>Upload your church logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoPreview && (
            <div className="flex justify-center p-4 border rounded-lg bg-muted">
              <img src={logoPreview || "/placeholder.svg"} alt="Logo preview" className="max-h-32 object-contain" />
            </div>
          )}
          <div>
            <Label htmlFor="logo">Upload Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="cursor-pointer" />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colors
          </CardTitle>
          <CardDescription>Customize your brand colors</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={theme.primary_color}
                onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.primary_color}
                onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                type="color"
                value={theme.secondary_color}
                onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.secondary_color}
                onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent_color">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accent_color"
                type="color"
                value={theme.accent_color}
                onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.accent_color}
                onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background_color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background_color"
                type="color"
                value={theme.background_color}
                onChange={(e) => setTheme({ ...theme, background_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.background_color}
                onChange={(e) => setTheme({ ...theme, background_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="text_color"
                type="color"
                value={theme.text_color}
                onChange={(e) => setTheme({ ...theme, text_color: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.text_color}
                onChange={(e) => setTheme({ ...theme, text_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
          <CardDescription>Customize fonts and sizes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="heading_font">Heading Font</Label>
            <Input
              id="heading_font"
              type="text"
              value={theme.heading_font}
              onChange={(e) => setTheme({ ...theme, heading_font: e.target.value })}
              placeholder="Inter, Arial, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_font">Body Font</Label>
            <Input
              id="body_font"
              type="text"
              value={theme.body_font}
              onChange={(e) => setTheme({ ...theme, body_font: e.target.value })}
              placeholder="Inter, Arial, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font_size_base">Base Font Size</Label>
            <Input
              id="font_size_base"
              type="text"
              value={theme.font_size_base}
              onChange={(e) => setTheme({ ...theme, font_size_base: e.target.value })}
              placeholder="16px, 1rem, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font_size_heading">Heading Font Size</Label>
            <Input
              id="font_size_heading"
              type="text"
              value={theme.font_size_heading}
              onChange={(e) => setTheme({ ...theme, font_size_heading: e.target.value })}
              placeholder="32px, 2rem, etc."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Theme"}
        </Button>
      </div>
    </div>
  )
}
