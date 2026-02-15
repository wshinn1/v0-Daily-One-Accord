"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2 } from "lucide-react"
import { PLAN_DETAILS } from "@/lib/stripe/config"

interface WidgetConfig {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: string
  showComparison: boolean
  showMonthlyOnly: boolean
  highlightPlan: string
}

interface EmbeddablePricingWidgetProps {
  config: WidgetConfig
}

export function EmbeddablePricingWidget({ config }: EmbeddablePricingWidgetProps) {
  const plans = Object.entries(PLAN_DETAILS)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [churchName, setChurchName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubscribe = async (planKey: string) => {
    setSelectedPlan(planKey)
    setError("")
  }

  const handleCheckout = async () => {
    if (!email || !selectedPlan) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          setupFeeTier: "launch", // Default to launch pricing
          email,
          churchName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error("[v0] Checkout error:", err)
      setError(err.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div style={{ color: config.textColor }}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: config.textColor }}>
          Choose Your Plan
        </h1>
        <p className="text-lg opacity-80">Simple, transparent pricing for churches of all sizes</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        {plans.map(([key, plan]) => {
          const isHighlighted = key === config.highlightPlan
          const isSelected = selectedPlan === key
          return (
            <Card
              key={key}
              className="p-6 flex flex-col transition-transform hover:scale-105"
              style={{
                borderColor: isSelected ? config.accentColor : isHighlighted ? config.primaryColor : "rgba(0,0,0,0.1)",
                borderWidth: isSelected || isHighlighted ? "2px" : "1px",
                borderRadius: `${config.borderRadius}px`,
                backgroundColor: config.backgroundColor,
              }}
            >
              {isHighlighted && (
                <div
                  className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full mb-4 self-start"
                  style={{ backgroundColor: config.primaryColor, color: "white" }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: config.textColor }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold" style={{ color: config.primaryColor }}>
                    ${plan.price}
                  </span>
                  <span className="opacity-70">/month</span>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  {plan.minSeats && plan.maxSeats
                    ? `${plan.minSeats}-${plan.maxSeats === 999 ? "Unlimited" : plan.maxSeats} Slack seats`
                    : "Unlimited seats"}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: config.accentColor }} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(key)}
                disabled={loading}
                style={{
                  backgroundColor: isHighlighted ? config.primaryColor : "transparent",
                  color: isHighlighted ? "white" : config.primaryColor,
                  borderColor: config.primaryColor,
                  borderWidth: "1px",
                  borderRadius: `${config.borderRadius}px`,
                }}
              >
                {isSelected ? "Selected" : "Get Started"}
              </Button>

              {typeof plan.additionalSeatPrice === "number" && (
                <p className="text-xs text-center opacity-70 mt-4">
                  Additional seats: ${plan.additionalSeatPrice}/month each
                </p>
              )}
            </Card>
          )
        })}
      </div>

      {selectedPlan && (
        <Card
          className="max-w-md mx-auto p-6 mb-12"
          style={{
            borderRadius: `${config.borderRadius}px`,
            backgroundColor: config.backgroundColor,
            borderColor: config.primaryColor,
            borderWidth: "2px",
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: config.textColor }}>
            Complete Your Subscription
          </h3>
          <p className="text-sm opacity-70 mb-6">
            You've selected the <strong>{PLAN_DETAILS[selectedPlan as keyof typeof PLAN_DETAILS].name}</strong> plan.
            Enter your details to continue to secure checkout.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="churchName">Church Name (Optional)</Label>
              <Input
                id="churchName"
                type="text"
                placeholder="Your Church Name"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="mt-1"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPlan(null)
                  setError("")
                }}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={loading || !email}
                className="flex-1"
                style={{
                  backgroundColor: config.primaryColor,
                  color: "white",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Checkout"
                )}
              </Button>
            </div>

            <p className="text-xs opacity-70 text-center">
              Includes $79 one-time setup fee. Secure payment powered by Stripe.
            </p>
          </div>
        </Card>
      )}

      {/* Comparison Section */}
      {config.showComparison && (
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.textColor }}>
            Why Daily One Accord?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg" style={{ color: config.textColor }}>
                Key Advantages
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span style={{ color: config.accentColor }}>✓</span>
                  <span className="text-sm">All-in-one platform - no need for multiple tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: config.accentColor }}>✓</span>
                  <span className="text-sm">Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: config.accentColor }}>✓</span>
                  <span className="text-sm">Native Slack integration for attendance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: config.accentColor }}>✓</span>
                  <span className="text-sm">Modern, mobile-first design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: config.accentColor }}>✓</span>
                  <span className="text-sm">Setup starting at $79 vs $500+ elsewhere</span>
                </li>
              </ul>
            </div>

            <Card
              className="p-6"
              style={{
                borderRadius: `${config.borderRadius}px`,
                backgroundColor: config.backgroundColor,
                borderColor: "rgba(0,0,0,0.1)",
              }}
            >
              <h3 className="font-semibold mb-4 text-lg" style={{ color: config.textColor }}>
                Quick Comparison
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Starting Price</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold" style={{ color: config.primaryColor }}>
                      $24/mo
                    </span>
                    <span className="text-sm opacity-50">vs $50-100</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Setup Fee</span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold" style={{ color: config.primaryColor }}>
                      $79+
                    </span>
                    <span className="text-sm opacity-50">vs $500+</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm">Slack Integration</span>
                  <div className="flex items-center gap-4">
                    <span style={{ color: config.accentColor }}>✓ Included</span>
                    <span className="text-sm opacity-50">✗ Not Available</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">SMS Notifications</span>
                  <div className="flex items-center gap-4">
                    <span style={{ color: config.accentColor }}>✓ Included</span>
                    <span className="text-sm opacity-50">Extra Cost</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
