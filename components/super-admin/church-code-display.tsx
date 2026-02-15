"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, RefreshCw, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChurchCodeDisplayProps {
  churchId: string
  churchName: string
  currentCode: string
  onCodeUpdated: (newCode: string) => void
}

export function ChurchCodeDisplay({ churchId, churchName, currentCode, onCodeUpdated }: ChurchCodeDisplayProps) {
  const [code, setCode] = useState(currentCode)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!confirm("Are you sure you want to regenerate the church code? The old code will no longer work.")) {
      return
    }

    setRegenerating(true)
    setError(null)
    try {
      const supabase = createClient()

      console.log("[v0] Attempting to regenerate church code for:", churchId)

      // Call function to generate new code
      const { data: functionData, error: functionError } = await supabase.rpc("generate_church_code")

      if (functionError) {
        console.error("[v0] Error calling generate_church_code:", functionError)

        // Check if it's a missing function error
        if (functionError.code === "PGRST202" || functionError.message?.includes("Could not find")) {
          setError(
            "Database setup incomplete. Please run script 17 (scripts/17-add-church-code-system.sql) to enable church code generation.",
          )
          return
        }

        throw functionError
      }

      const newCode = functionData

      console.log("[v0] Generated new code:", newCode)

      // Update church with new code
      const { error: updateError } = await supabase
        .from("church_tenants")
        .update({ church_code: newCode })
        .eq("id", churchId)

      if (updateError) {
        console.error("[v0] Error updating church code:", updateError)

        // Check if it's a missing column error
        if (
          updateError.code === "42703" ||
          (updateError.message?.includes("column") && updateError.message?.includes("does not exist"))
        ) {
          setError(
            "Database setup incomplete. The church_code column doesn't exist. Please run script 17 (scripts/17-add-church-code-system.sql).",
          )
          return
        }

        throw updateError
      }

      console.log("[v0] Successfully updated church code")
      setCode(newCode)
      onCodeUpdated(newCode)
    } catch (error: any) {
      console.error("[v0] Error regenerating code:", error)
      setError(error.message || "Failed to regenerate code. Please try again.")
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Church Access Code</CardTitle>
        <CardDescription>Share this code with members to allow them to sign up for {churchName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Current Code</Label>
          <div className="flex gap-2">
            <Input value={code} readOnly className="font-mono text-lg font-bold" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button variant="outline" onClick={handleRegenerate} disabled={regenerating} className="w-full bg-transparent">
          <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Regenerating..." : "Regenerate Code"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Note: Regenerating the code will invalidate the old code. Make sure to share the new code with your members.
        </p>
      </CardContent>
    </Card>
  )
}
