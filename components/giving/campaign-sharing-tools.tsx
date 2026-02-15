"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Mail, Facebook, Twitter, MessageCircle, QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "qrcode.react"

interface CampaignSharingToolsProps {
  campaignId: string
  campaignName: string
  churchSlug: string
}

export function CampaignSharingTools({ campaignId, campaignName, churchSlug }: CampaignSharingToolsProps) {
  const [showQRCode, setShowQRCode] = useState(false)
  const { toast } = useToast()

  const campaignUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/give/${churchSlug}/campaign/${campaignId}`
  const shareText = `Support ${campaignName}! Every contribution makes a difference.`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      })
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Support ${campaignName}`)
    const body = encodeURIComponent(`${shareText}\n\n${campaignUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const shareViaFacebook = () => {
    const url = encodeURIComponent(campaignUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400")
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(shareText)
    const url = encodeURIComponent(campaignUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "width=600,height=400")
  }

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${campaignUrl}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${campaignName.replace(/\s+/g, "-")}-qr-code.png`
      link.href = url
      link.click()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Campaign
          </CardTitle>
          <CardDescription>Share this campaign with your community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campaign URL */}
          <div className="space-y-2">
            <Label>Campaign Link</Label>
            <div className="flex gap-2">
              <Input value={campaignUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(campaignUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Sharing Buttons */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={shareViaFacebook} className="justify-start bg-transparent">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" onClick={shareViaTwitter} className="justify-start bg-transparent">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" onClick={shareViaWhatsApp} className="justify-start bg-transparent">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={shareViaEmail} className="justify-start bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label>QR Code</Label>
            <Button variant="outline" onClick={() => setShowQRCode(true)} className="w-full justify-start">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code (for websites)</Label>
            <div className="flex gap-2">
              <Input
                value={`<iframe src="${campaignUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(`<iframe src="${campaignUrl}" width="100%" height="600" frameborder="0"></iframe>`)
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Campaign QR Code</DialogTitle>
            <DialogDescription>Scan this code to visit the campaign page</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode id="qr-code-canvas" value={campaignUrl} size={256} level="H" includeMargin />
            </div>
            <Button onClick={downloadQRCode} className="w-full">
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
