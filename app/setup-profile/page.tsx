"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

export default function SetupProfilePage() {
  const [status, setStatus] = useState<"loading" | "error" | "creating">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const createUserRecord = async () => {
    try {
      setStatus("creating")
      console.log("[v0] Calling setup-user API...")

      const response = await fetch("/api/setup-user", {
        method: "POST",
      })

      console.log("[v0] API response status:", response.status)

      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user record")
      }

      if (data.role === "super_admin") {
        console.log("[v0] Redirecting to super-admin...")
        router.push("/super-admin")
      } else if (data.church_tenant_id) {
        console.log("[v0] Redirecting to dashboard...")
        router.push("/dashboard")
      } else {
        console.log("[v0] No church assigned, redirecting to signup...")
        setErrorMessage("Please complete your signup by selecting a church")
        setStatus("error")
      }
    } catch (error) {
      console.error("[v0] Create user error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error")
      setStatus("error")
    }
  }

  useEffect(() => {
    const setupProfile = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log("[v0] No user found, redirecting to login...")
          router.push("/login")
          return
        }

        console.log("[v0] User found, checking for user record:", user.id)

        const { data: existingUser } = await supabase
          .from("users")
          .select("role, church_tenant_id, is_super_admin")
          .eq("id", user.id)
          .maybeSingle()

        if (existingUser) {
          console.log("[v0] User record exists, redirecting...")
          if (existingUser.is_super_admin) {
            router.push("/super-admin")
          } else {
            router.push("/dashboard")
          }
          return
        }

        console.log("[v0] No user record found, creating...")
        await createUserRecord()
      } catch (error) {
        console.error("[v0] Setup profile error:", error)
        setErrorMessage(error instanceof Error ? error.message : "Unknown error")
        setStatus("error")
      }
    }

    setupProfile()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Setting Up Your Profile</CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we set up your account..."}
            {status === "creating" && "Creating your user profile..."}
            {status === "error" && "There was an issue setting up your profile."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" || status === "creating" ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive">Setup failed: {errorMessage}</p>
              <Button onClick={createUserRecord} className="w-full">
                Retry Setup
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
