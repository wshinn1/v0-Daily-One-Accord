"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Key, CheckCircle } from "lucide-react"

interface BusinessPlanInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BusinessPlanInviteDialog({ open, onOpenChange, onSuccess }: BusinessPlanInviteDialogProps) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setGeneratedPassword(null)
    setShowSuccess(false)

    try {
      const response = await fetch("/api/business-plan/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          full_name: fullName.trim() || email.split("@")[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation")
      }

      if (data.existingUser) {
        setShowSuccess(true)
        setEmail("")
        setFullName("")
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          setShowSuccess(false)
        }, 3000)
      } else {
        setGeneratedPassword(data.password)
        setShowSuccess(true)
        setEmail("")
        setFullName("")
        setTimeout(() => {
          onSuccess()
          onOpenChange(false)
          setShowSuccess(false)
          setGeneratedPassword(null)
        }, 5000)
      }
    } catch (err: any) {
      console.error("Error inviting user:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User to Business Plan</DialogTitle>
          <DialogDescription>Send an invitation with an auto-generated secure password via email</DialogDescription>
        </DialogHeader>

        {!showSuccess ? (
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                An email will be sent with login credentials and a secure 16-character auto-generated password.
              </AlertDescription>
            </Alert>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !email || !fullName}>
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <p className="font-semibold mb-2">Invitation sent successfully!</p>
                <p className="text-sm">The user will receive an email with their login credentials.</p>
              </AlertDescription>
            </Alert>
            {generatedPassword && (
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Auto-Generated Password:</p>
                  <code className="block p-2 bg-muted rounded text-sm font-mono break-all">{generatedPassword}</code>
                  <p className="text-xs mt-2 text-muted-foreground">
                    This password has been emailed to the user. Save it if needed for your records.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
