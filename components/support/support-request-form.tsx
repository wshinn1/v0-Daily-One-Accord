"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle, Lightbulb, Send, CheckCircle2 } from "lucide-react"

interface SupportRequestFormProps {
  user: {
    id: string
    email: string
    full_name: string
  }
  churchName: string
  churchTenantId: string
}

export function SupportRequestForm({ user, churchName, churchTenantId }: SupportRequestFormProps) {
  const [requestType, setRequestType] = useState<"help" | "feature">("help")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          subject,
          description,
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          churchName,
          churchTenantId,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit request")

      setIsSubmitted(true)
      toast({
        title: "Request submitted",
        description: "We'll respond within 48 hours. Check your email for confirmation.",
      })

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setSubject("")
        setDescription("")
      }, 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Request Submitted!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for reaching out. We've received your{" "}
            {requestType === "help" ? "help request" : "feature request"}.
          </p>
          <p className="text-muted-foreground">
            We'll respond within 48 hours. Sometimes it's quicker! Check your email at <strong>{user.email}</strong> for
            our response.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
        <p className="text-lg text-muted-foreground">Need help or have a feature idea? We're here to assist you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card
          className={`p-6 cursor-pointer transition-all border-2 ${
            requestType === "help" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => setRequestType("help")}
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Help Request</h3>
              <p className="text-sm text-muted-foreground">
                Having trouble with something? Need assistance with a feature? We're here to help you resolve any
                issues.
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all border-2 ${
            requestType === "feature" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => setRequestType("feature")}
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Feature Request</h3>
              <p className="text-sm text-muted-foreground">
                Have an idea to improve the platform? We'd love to hear your suggestions for new features or
                enhancements.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={user.full_name} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="church">Church</Label>
            <Input id="church" value={churchName} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-type">Request Type</Label>
            <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
              <SelectTrigger id="request-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="help">Help Request</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                requestType === "help" ? "Brief description of the issue" : "Brief description of your feature idea"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                requestType === "help"
                  ? "Please provide as much detail as possible about the issue you're experiencing..."
                  : "Tell us about your feature idea and how it would help you..."
              }
              rows={8}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">We typically respond within 48 hours, often sooner.</p>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
