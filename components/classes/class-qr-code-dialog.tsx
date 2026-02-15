"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Download, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClassQRCodeDialogProps {
  classData: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClassQRCodeDialog({ classData, open, onOpenChange }: ClassQRCodeDialogProps) {
  const [registrationUrl, setRegistrationUrl] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (classData && typeof window !== "undefined") {
      const url = `${window.location.origin}/register/class/${classData.id}`
      setRegistrationUrl(url)
      setEmbedCode(`<iframe src="${url}" width="100%" height="800" frameborder="0"></iframe>`)
    }
  }, [classData])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const downloadQRCode = () => {
    if (!classData.qr_code_url) {
      toast({
        title: "QR Code Not Available",
        description: "QR code is being generated. Please try again in a moment.",
        variant: "destructive",
      })
      return
    }

    // Download the stored QR code
    const link = document.createElement("a")
    link.href = classData.qr_code_url
    link.download = `${classData.name}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your downloads",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Class Registration QR Code & Embed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <h3 className="font-semibold mb-4">QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block border">
              {classData.qr_code_url ? (
                <img
                  src={classData.qr_code_url || "/placeholder.svg"}
                  alt="Class Registration QR Code"
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Scan this QR code to register for {classData.name}</p>
            <Button onClick={downloadQRCode} className="mt-4" disabled={!classData.qr_code_url}>
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>

          {/* Registration URL */}
          <div>
            <Label>Registration URL</Label>
            <div className="flex gap-2 mt-2">
              <Input value={registrationUrl} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(registrationUrl, "URL")}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.open(registrationUrl, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Share this link for online registration</p>
          </div>

          {/* Embed Code */}
          <div>
            <Label>Embed Code for Website</Label>
            <div className="flex gap-2 mt-2">
              <Input value={embedCode} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(embedCode, "Embed code")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Copy this code to embed the registration form on your website
            </p>
          </div>

          {/* Usage Instructions */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Print the QR code and display it in your lobby or on screens</li>
              <li>Share the registration URL on social media or in emails</li>
              <li>Embed the registration form directly on your church website</li>
              <li>Track registrations in the Classes dashboard</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
