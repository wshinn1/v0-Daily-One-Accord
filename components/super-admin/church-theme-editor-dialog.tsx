"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeCustomization } from "./theme-customization"

interface ChurchThemeEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: {
    id: string
    name: string
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

export function ChurchThemeEditorDialog({ open, onOpenChange, church }: ChurchThemeEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Theme for {church.name}</DialogTitle>
          <DialogDescription>Customize the look and feel of the dashboard for this church tenant</DialogDescription>
        </DialogHeader>
        <ThemeCustomization
          tenantId={church.id}
          currentTheme={{
            logo_url: church.logo_url,
            primary_color: church.primary_color,
            secondary_color: church.secondary_color,
            accent_color: church.accent_color,
            background_color: church.background_color,
            text_color: church.text_color,
            heading_font: church.heading_font,
            body_font: church.body_font,
            font_size_base: church.font_size_base,
            font_size_heading: church.font_size_heading,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
