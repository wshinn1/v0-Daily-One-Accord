"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface NDASigningFormProps {
  user: {
    id: string
    email: string
    full_name: string
  }
}

export function NDASigningForm({ user }: NDASigningFormProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fullName, setFullName] = useState(user.full_name)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Set drawing styles
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast.error("Please provide your signature")
      return
    }

    if (!agreed) {
      toast.error("Please agree to the terms")
      return
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    setIsSubmitting(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error("Canvas not found")

      // Get signature as base64
      const signatureData = canvas.toDataURL("image/png")

      // Submit signature
      const response = await fetch("/api/business-plan/nda/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureData,
          fullName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit signature")
      }

      toast.success("NDA signed successfully!")
      router.push("/business-plan")
      router.refresh()
    } catch (error) {
      console.error("Error signing NDA:", error)
      toast.error(error instanceof Error ? error.message : "Failed to sign NDA")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mutual Non-Disclosure Agreement</CardTitle>
          <CardDescription>Please review and sign the NDA to access the business plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* NDA Content */}
          <div className="prose prose-sm max-w-none h-96 overflow-y-auto border rounded-lg p-6 bg-muted/30">
            <h1 className="text-xl font-bold">MUTUAL NON-DISCLOSURE AGREEMENT</h1>

            <p className="text-sm">
              <strong>This Mutual Non-Disclosure Agreement</strong> ("Agreement") is entered into as of the date of
              signature ("Effective Date") by and between:
            </p>

            <p className="text-sm">
              <strong>PARTY A:</strong>
              <br />
              Daily One Accord
              <br />
              Represented by: Wes Shinn, Founder & CEO
            </p>

            <p className="text-sm">
              <strong>PARTY B:</strong>
              <br />
              {fullName}
              <br />
              {user.email}
            </p>

            <p className="text-sm">
              Party A and Party B are collectively referred to as the "Parties" and individually as a "Party."
            </p>

            <h2 className="text-lg font-semibold mt-6">RECITALS</h2>

            <p className="text-sm">
              WHEREAS, the Parties wish to explore a business relationship concerning church management software,
              technology solutions, and related services (the "Purpose"); and
            </p>

            <p className="text-sm">
              WHEREAS, in connection with the Purpose, each Party may disclose to the other certain confidential and
              proprietary information; and
            </p>

            <p className="text-sm">
              WHEREAS, each Party desires to protect the confidentiality of its Confidential Information (as defined
              below);
            </p>

            <p className="text-sm">
              NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other
              good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties
              agree as follows:
            </p>

            <h2 className="text-lg font-semibold mt-6">1. DEFINITION OF CONFIDENTIAL INFORMATION</h2>

            <p className="text-sm">
              <strong>1.1 Confidential Information</strong> means any information, whether written, oral, electronic, or
              visual, disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party") that:
            </p>

            <p className="text-sm">
              (a) Is marked as "Confidential," "Proprietary," or with a similar designation; or
              <br />
              (b) Would reasonably be considered confidential given the nature of the information and the circumstances
              of disclosure; or
              <br />
              (c) Is disclosed orally and identified as confidential at the time of disclosure, and is summarized in
              writing and delivered to the Receiving Party within thirty (30) days of disclosure.
            </p>

            <p className="text-sm">
              <strong>1.2 Examples of Confidential Information</strong> include, but are not limited to:
            </p>

            <ul className="text-sm list-disc pl-6">
              <li>Business plans, strategies, and financial information</li>
              <li>Product designs, specifications, and roadmaps</li>
              <li>Source code, algorithms, and technical documentation</li>
              <li>Customer lists, pricing information, and marketing strategies</li>
              <li>Trade secrets and proprietary methodologies</li>
              <li>Any information related to Daily One Accord's platform, architecture, or intellectual property</li>
              <li>Information regarding potential partnerships, investments, or business opportunities</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">2. OBLIGATIONS OF RECEIVING PARTY</h2>

            <p className="text-sm">
              The Receiving Party agrees to hold all Confidential Information in strict confidence, not disclose it to
              any third party without prior written consent, use it solely for the Purpose, and protect it using
              reasonable care.
            </p>

            <h2 className="text-lg font-semibold mt-6">3. TERM AND TERMINATION</h2>

            <p className="text-sm">
              This Agreement shall commence on the Effective Date and continue for a period of two (2) years. The
              obligations shall survive termination and continue for five (5) years from the date of termination.
            </p>

            <h2 className="text-lg font-semibold mt-6">4. GENERAL PROVISIONS</h2>

            <p className="text-sm">
              This Agreement constitutes the entire agreement between the Parties and may only be amended in writing.
              Electronic signatures shall have the same force and effect as original signatures.
            </p>

            <p className="text-sm mt-4 italic">
              *This is a legally binding agreement. By signing below, you acknowledge that you have read, understand,
              and agree to be bound by its terms and conditions.*
            </p>
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full legal name"
              required
            />
          </div>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <Label>Electronic Signature</Label>
            <div className="border-2 border-dashed rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
              Clear Signature
            </Button>
          </div>

          {/* Agreement Checkbox */}
          <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-primary">Required</span>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-1 h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer font-medium">
                I have read and agree to the terms of this Mutual Non-Disclosure Agreement. I understand that this is a
                legally binding document and that my electronic signature has the same legal effect as a handwritten
                signature.
              </Label>
            </div>
            {!agreed && <p className="text-xs text-muted-foreground pl-8">You must check this box to continue</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button onClick={handleSubmit} disabled={!hasSignature || !agreed || isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Sign and Continue"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By clicking "Sign and Continue", you agree that your electronic signature is the legal equivalent of your
            manual signature on this agreement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
