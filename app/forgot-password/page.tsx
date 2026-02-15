"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    console.log("[v0] 🔵 Password reset initiated for email:", email)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
        ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/reset-password`
        : `${window.location.origin}/reset-password`

      console.log("[v0] 🔵 Redirect URL configured:", redirectUrl)
      console.log("[v0] 🔵 Environment variables check:", {
        hasDevUrl: !!process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
        devUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
        origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      })

      console.log("[v0] 🔵 Calling Supabase resetPasswordForEmail...")
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      console.log("[v0] 🔵 Supabase response:", { data, error })

      if (error) {
        console.error("[v0] 🔴 Supabase error:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
        })
        throw error
      }

      console.log("[v0] 🟢 Password reset email sent successfully!")
      setSuccess(true)
      setEmail("")
    } catch (err: any) {
      console.error("[v0] 🔴 Password reset failed:", {
        message: err.message,
        error: err,
        email: email,
      })
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
      console.log("[v0] 🔵 Password reset flow completed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset email sent! Check your inbox and click the link to reset your password.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-primary hover:underline">
              Back to Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
