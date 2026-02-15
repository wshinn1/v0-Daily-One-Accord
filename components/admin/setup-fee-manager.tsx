"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SETUP_FEE_DETAILS, type SetupFeeTier } from "@/lib/stripe/config"

export function SetupFeeManager() {
  const [selectedTier, setSelectedTier] = useState<SetupFeeTier>("standard")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/update-setup-fee-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      })

      if (!response.ok) throw new Error("Failed to update setup fee tier")

      alert("Setup fee tier updated successfully!")
    } catch (error) {
      console.error("[v0] Save error:", error)
      alert("Failed to update setup fee tier")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Setup Fee Configuration</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Choose which setup fee tier to offer to new customers. This affects all new signups.
      </p>

      <RadioGroup value={selectedTier} onValueChange={(value) => setSelectedTier(value as SetupFeeTier)}>
        <div className="space-y-4">
          {Object.entries(SETUP_FEE_DETAILS).map(([key, details]) => (
            <div
              key={key}
              className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <RadioGroupItem value={key} id={key} className="mt-1" />
              <Label htmlFor={key} className="flex-grow cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{details.name}</span>
                  <span className="text-2xl font-bold">${details.amount}</span>
                </div>
                <p className="text-sm text-muted-foreground">{details.description}</p>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
        {saving ? "Saving..." : "Save Configuration"}
      </Button>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Custom Signup Links</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Share these links to offer specific setup fee tiers to individual customers:
        </p>
        <div className="space-y-2">
          {Object.keys(SETUP_FEE_DETAILS).map((tier) => (
            <div key={tier} className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded flex-grow">
                {process.env.NEXT_PUBLIC_SITE_URL}/signup?setup={tier}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/signup?setup=${tier}`)
                  alert("Link copied!")
                }}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
