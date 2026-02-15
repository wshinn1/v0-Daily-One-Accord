"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Copy, Code, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GivingEmbedCodeGeneratorProps {
  churchSlug: string
  churchName: string
}

export function GivingEmbedCodeGenerator({ churchSlug, churchName }: GivingEmbedCodeGeneratorProps) {
  const [config, setConfig] = useState({
    primaryColor: "#3b82f6",
    showHeader: true,
    headerText: `Give to ${churchName}`,
  })
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const siteUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ""
  const embedUrl = `${siteUrl}/embed/giving/${churchSlug}?config=${encodeURIComponent(JSON.stringify(config))}`

  const generateEmbedCode = () => {
    return `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Embed Giving Form
          </CardTitle>
          <CardDescription>Add your giving form to your church website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customization Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Customize Appearance</h3>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showHeader">Show Header</Label>
                <p className="text-sm text-muted-foreground">Display church name at the top</p>
              </div>
              <Switch
                id="showHeader"
                checked={config.showHeader}
                onCheckedChange={(checked) => setConfig({ ...config, showHeader: checked })}
              />
            </div>

            {config.showHeader && (
              <div className="space-y-2">
                <Label htmlFor="headerText">Header Text</Label>
                <Input
                  id="headerText"
                  value={config.headerText}
                  onChange={(e) => setConfig({ ...config, headerText: e.target.value })}
                  placeholder={`Give to ${churchName}`}
                />
              </div>
            )}
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <Label>Direct Link</Label>
            <div className="flex gap-2">
              <Input value={embedUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(embedUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code (for websites)</Label>
            <div className="relative">
              <Textarea value={generateEmbedCode()} readOnly className="font-mono text-xs h-32 pr-12" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(generateEmbedCode())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">How to Add to Your Website:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Copy the embed code above</li>
              <li>Go to your website editor (WordPress, Wix, Squarespace, etc.)</li>
              <li>Add a "Custom HTML" or "Embed" block</li>
              <li>Paste the embed code</li>
              <li>Save and publish your page</li>
            </ol>
          </div>

          {/* Preview Button */}
          <Button onClick={() => setShowPreview(true)} className="w-full" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Embedded Form
          </Button>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Embedded Giving Form Preview</DialogTitle>
            <DialogDescription>This is how your giving form will appear on your website</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <iframe src={embedUrl} width="100%" height="800" frameBorder="0" style={{ border: "none" }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
