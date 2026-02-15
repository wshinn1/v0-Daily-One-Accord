"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [selectedChurch, setSelectedChurch] = useState("")
  const [churchCode, setChurchCode] = useState("")
  const [churches, setChurches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingChurches, setLoadingChurches] = useState(true)
  const [error, setError] = useState("")
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadChurches()
    const inviteParam = searchParams.get("invite")
    if (inviteParam) {
      setInvitationId(inviteParam)
      loadInvitation(inviteParam)
    }
  }, [searchParams])

  const loadInvitation = async (inviteId: string) => {
    setInvitationLoading(true)
    try {
      const supabase = createClient()
      const { data: invitation, error } = await supabase
        .from("user_invitations")
        .select("*, church_tenants(id, name, church_code)")
        .eq("id", inviteId)
        .single()

      if (error || !invitation) {
        setError("Invalid or expired invitation link")
        return
      }

      console.log("[v0] Invitation loaded with role:", invitation.role)

      // Pre-fill form with invitation data
      setEmail(invitation.email)
      const church = invitation.church_tenants as any
      setSelectedChurch(church.id)
      setChurchCode(church.church_code || "")
    } catch (err: any) {
      console.error("[v0] Error loading invitation:", err)
      setError("Failed to load invitation details")
    } finally {
      setInvitationLoading(false)
    }
  }

  const loadChurches = async () => {
    try {
      console.log("[v0] Loading churches...")
      const supabase = createClient()

      let { data, error } = await supabase.from("church_tenants").select("id, name, slug, church_code").order("name")

      // If church_code column doesn't exist yet, fetch without it
      if (error && error.message?.includes("church_code")) {
        console.log("[v0] church_code column not found, fetching without it")
        const fallbackResult = await supabase.from("church_tenants").select("id, name, slug").order("name")

        data = fallbackResult.data
        error = fallbackResult.error
      }

      console.log("[v0] Churches loaded:", data)
      console.log("[v0] Churches error:", error)

      if (error) throw error

      setChurches(data || [])
    } catch (err: any) {
      console.error("[v0] Error loading churches:", err.message)
      setError("Failed to load churches. Please refresh the page.")
    } finally {
      setLoadingChurches(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedChurch) {
      setError("Please select a church")
      setLoading(false)
      return
    }

    if (!churchCode.trim()) {
      setError("Please enter your church code")
      setLoading(false)
      return
    }

    const selectedChurchData = churches.find((c) => c.id === selectedChurch)

    // Only validate church code if the feature is enabled (church_code exists)
    if (selectedChurchData && "church_code" in selectedChurchData) {
      if (!selectedChurchData.church_code || selectedChurchData.church_code !== churchCode.toUpperCase().trim()) {
        setError("Invalid church code. Please check with your church administrator.")
        setLoading(false)
        return
      }
    } else if (churchCode.trim()) {
      // Church codes not set up yet, but user entered one
      setError("Church code validation is not yet configured. Please contact your administrator.")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Starting signup process...")
      const supabase = createClient()

      let invitationRole = "member"
      if (invitationId) {
        console.log("[v0] Fetching invitation role before signup...")
        const { data: invitation } = await supabase
          .from("user_invitations")
          .select("role")
          .eq("id", invitationId)
          .single()

        if (invitation) {
          invitationRole = invitation.role
          console.log("[v0] Using invitation role for signup:", invitationRole)
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            church_tenant_id: selectedChurch,
            role: invitationRole,
          },
        },
      })

      console.log("[v0] 🔵 Auth signup response:", {
        userId: authData.user?.id,
        email: authData.user?.email,
        emailConfirmedAt: authData.user?.email_confirmed_at,
        confirmedAt: authData.user?.confirmed_at,
        identities: authData.user?.identities?.length,
        session: authData.session ? "Session created" : "No session (needs confirmation)",
      })

      if (authError) {
        console.error("[v0] 🔴 Signup auth error:", authError)

        if (
          authError.message?.includes("User already registered") ||
          authError.message?.includes("already registered")
        ) {
          console.log("[v0] 🟡 User already exists, checking if they were removed from this church...")

          const checkResponse = await fetch("/api/users/check-removed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              churchTenantId: selectedChurch,
            }),
          })

          const checkData = await checkResponse.json()

          if (checkData.wasRemoved) {
            console.log("[v0] 🟡 User was removed, sending password reset email...")

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password?redirect=/accept-invitation?invite=${invitationId}`,
            })

            if (resetError) {
              console.error("[v0] Error sending password reset:", resetError)
            }

            setError(
              "This email is already registered and you were previously removed from this church. We've sent you a password reset email. After resetting your password, you'll need to sign in and accept the invitation again to regain access.",
            )
            setLoading(false)
            return
          }

          setError(
            "This email is already registered. Please sign in with your existing password, or use the 'Forgot Password' link on the login page.",
          )
          setLoading(false)
          return
        }

        throw authError
      }

      if (!authData.session && authData.user) {
        console.log("[v0] 🟡 Email confirmation required - user should receive confirmation email")
        console.log("[v0] 🟡 Check your email inbox (and spam folder) for confirmation link")
      } else if (authData.session) {
        console.log("[v0] 🟢 User logged in immediately - email confirmation is disabled")
      }

      console.log("[v0] Auth signup successful, user created:", authData.user?.id)

      if (authData.user && invitationId) {
        console.log("[v0] Processing invitation with role:", invitationRole)

        const acceptResponse = await fetch("/api/users/accept-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId,
            userId: authData.user.id,
          }),
        })

        const acceptData = await acceptResponse.json()

        if (!acceptData.success) {
          console.error("[v0] Error accepting invitation:", acceptData.error)
        } else {
          console.log("[v0] Invitation accepted successfully")
        }

        const { error: inviteError } = await supabase
          .from("user_invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
          })
          .eq("id", invitationId)

        if (inviteError) {
          console.error("[v0] Error updating invitation:", inviteError)
        } else {
          console.log("[v0] Invitation marked as accepted")
        }
      }

      if (authData.user) {
        try {
          console.log("[v0] Sending Slack notification...")
          const slackResponse = await fetch("/api/slack/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tenantId: selectedChurch,
              eventType: "new_user_signup",
              data: {
                full_name: fullName,
                email: authData.user.email,
                church_name: selectedChurchData?.name || "Unknown Church",
                role: invitationRole,
              },
            }),
          })

          const slackData = await slackResponse.json()
          if (slackData.skipped) {
            console.log("[v0] Slack notification skipped:", slackData.reason)
          } else {
            console.log("[v0] Slack notification sent successfully")
          }
        } catch (slackError) {
          console.error("[v0] Error sending Slack notification (non-critical):", slackError)
          // Don't fail signup if Slack notification fails
        }
      }

      console.log("[v0] Signup complete, redirecting to success page...")
      router.push("/signup-success")
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (invitationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Mail className="h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {invitationId ? "Accept Your Invitation" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {invitationId ? "Complete your registration to join your church" : "Enter your information to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!invitationId}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church">Select Your Church</Label>
              <Select
                value={selectedChurch}
                onValueChange={setSelectedChurch}
                disabled={loadingChurches || !!invitationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingChurches ? "Loading churches..." : "Choose a church"} />
                </SelectTrigger>
                <SelectContent>
                  {churches.length === 0 && !loadingChurches ? (
                    <div className="p-2 text-sm text-muted-foreground">No churches available</div>
                  ) : (
                    churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the church you're joining. If you don't see your church, contact your church administrator.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="churchCode">Church Code</Label>
              <Input
                id="churchCode"
                type="text"
                placeholder="Enter your church code"
                value={churchCode}
                onChange={(e) => setChurchCode(e.target.value.toUpperCase())}
                required
                maxLength={20}
                className="uppercase"
                disabled={!!invitationId}
              />
              <p className="text-xs text-muted-foreground">
                Enter the unique code provided by your church administrator to verify your registration.
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading || loadingChurches}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
