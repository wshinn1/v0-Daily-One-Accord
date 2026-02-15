"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Mail } from "lucide-react"

export default function AcceptInvitationPage() {
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteId = searchParams.get("invite")

  useEffect(() => {
    if (!inviteId) {
      setError("No invitation ID provided")
      setLoading(false)
      return
    }

    checkInvitationAndUser()
  }, [inviteId])

  const checkInvitationAndUser = async () => {
    try {
      const supabase = createClient()

      // Check if user is signed in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // User not signed in, redirect to login with invitation link
        router.push(`/login?redirect=/accept-invitation?invite=${inviteId}`)
        return
      }

      // Get invitation details
      const { data: inviteData, error: inviteError } = await supabase
        .from("user_invitations")
        .select("*, church_tenants(id, name)")
        .eq("id", inviteId)
        .single()

      if (inviteError || !inviteData) {
        setError("Invalid or expired invitation")
        setLoading(false)
        return
      }

      // Check if invitation email matches user email
      if (inviteData.email !== user.email) {
        setError("This invitation is for a different email address")
        setLoading(false)
        return
      }

      // Check if invitation is already accepted
      if (inviteData.status === "accepted" && inviteData.accepted_at) {
        setError("This invitation has already been accepted")
        setLoading(false)
        return
      }

      setInvitation(inviteData)
      setLoading(false)
    } catch (err: any) {
      console.error("[v0] Error checking invitation:", err)
      setError("Failed to load invitation details")
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    setAccepting(true)
    setError("")

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be signed in to accept this invitation")
        setAccepting(false)
        return
      }

      // Call accept invitation API
      const response = await fetch("/api/users/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: inviteId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to accept invitation")
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error accepting invitation:", err)
      setError(err.message || "Failed to accept invitation")
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Mail className="h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Invitation Accepted!</CardTitle>
            </div>
            <CardDescription>You now have access to {invitation?.church_tenants?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitation?.church_tenants?.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && invitation && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click the button below to accept this invitation and regain access to the church.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Email:</strong> {invitation.email}
                  </p>
                  <p className="text-sm">
                    <strong>Role:</strong> {invitation.role}
                  </p>
                </div>
              </div>

              <Button onClick={handleAcceptInvitation} disabled={accepting} className="w-full">
                {accepting ? "Accepting..." : "Accept Invitation"}
              </Button>
            </>
          )}

          {error && (
            <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
