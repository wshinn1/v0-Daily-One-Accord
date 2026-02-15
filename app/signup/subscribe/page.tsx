"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { PLAN_DETAILS } from "@/lib/stripe/config"

export default function SubscribeSignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [churchName, setChurchName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const plan = searchParams.get("plan")
    if (plan && ["starter", "growth", "enterprise"].includes(plan)) {
      setSelectedPlan(plan)
    } else {
      router.push("/pricing")
    }
  }, [searchParams, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!churchName.trim()) {
      setError("Please enter your church name")
      setLoading(false)
      return
    }

    if (!selectedPlan) {
      setError("No plan selected")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Starting subscription signup process...")

      console.log("[v0] Creating Stripe checkout session...")
      const checkoutResponse = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: selectedPlan,
          setupFeeTier: "promotional",
          email: email,
          churchName: churchName,
          fullName: fullName,
          password: password,
        }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { url } = await checkoutResponse.json()

      if (!url) {
        throw new Error("No checkout URL returned")
      }

      console.log("[v0] Redirecting to Stripe checkout...")
      // Store signup data in sessionStorage to complete after payment
      sessionStorage.setItem(
        "pendingSignup",
        JSON.stringify({
          email,
          password,
          fullName,
          churchName,
          planType: selectedPlan,
        }),
      )

      // Redirect to Stripe checkout
      window.location.href = url
    } catch (err: any) {
      console.error("[v0] Subscription signup error:", err)
      setError(err.message || "An error occurred during signup")
      setLoading(false)
    }
  }

  const planDetails = selectedPlan ? PLAN_DETAILS[selectedPlan as keyof typeof PLAN_DETAILS] : null

  if (!selectedPlan || !planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
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
          <CardTitle className="text-2xl font-bold">Start Your Subscription</CardTitle>
          <CardDescription>
            You've selected the <span className="font-semibold">{planDetails.name}</span> plan at ${planDetails.price}
            /month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="churchName">Church Name</Label>
              <Input
                id="churchName"
                type="text"
                placeholder="First Baptist Church"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">The name of your church or organization</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Your Full Name</Label>
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@church.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-semibold text-sm">What happens next:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Complete secure payment with Stripe</li>
                <li>Your church account will be created automatically</li>
                <li>Receive your unique church code via email</li>
                <li>Access your dashboard and invite your team</li>
              </ol>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment"
              )}
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
