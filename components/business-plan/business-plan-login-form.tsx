"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function BusinessPlanLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading || isRedirecting) {
      console.log("[v0] Submission blocked - already processing")
      return
    }

    setError("")
    setLoading(true)

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    console.log("[v0] Attempting login with email:", trimmedEmail)
    console.log("[v0] Password length:", trimmedPassword.length)
    console.log("[v0] Password starts with:", trimmedPassword.substring(0, 3))

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (signInError) {
        console.error("[v0] Login error details:", {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
        })
        console.error("[v0] Full error object:", JSON.stringify(signInError, null, 2))

        if (signInError.message.includes("Invalid login credentials")) {
          setError(
            "Invalid email or password. Please check your credentials and try again. Make sure you're using the exact password from the invitation email.",
          )
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before logging in.")
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      console.log("[v0] Login successful!")
      console.log("[v0] User ID:", data.user?.id)
      console.log("[v0] User email:", data.user?.email)
      console.log("[v0] Session exists:", !!data.session)

      setIsRedirecting(true)
      setEmail("")
      setPassword("")

      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/business-plan")
      router.refresh()
    } catch (err) {
      console.error("[v0] Unexpected login error:", err)
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
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
          placeholder="Enter your password"
          autoComplete="current-password"
          autoCorrect="off"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || isRedirecting}>
        {isRedirecting ? "Redirecting..." : loading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center">
        <Link href="/business-plan/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
          Forgot your password?
        </Link>
      </div>
    </form>
  )
}
