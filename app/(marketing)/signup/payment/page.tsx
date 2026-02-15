"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, Users, Check } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { PLAN_DETAILS, ADDON_DETAILS, type PlanType } from "@/lib/stripe/config"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PlanSelector({
  selectedPlan,
  onPlanChange,
}: { selectedPlan: PlanType; onPlanChange: (plan: PlanType) => void }) {
  const plans: PlanType[] = ["starter", "growth", "enterprise"]

  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-semibold">Select Your Plan</h3>
      <RadioGroup value={selectedPlan} onValueChange={(value) => onPlanChange(value as PlanType)}>
        {plans.map((plan) => {
          const details = PLAN_DETAILS[plan]
          const price = details.launchPrice || details.price
          return (
            <div key={plan} className="relative">
              <RadioGroupItem value={plan} id={plan} className="peer sr-only" />
              <Label
                htmlFor={plan}
                className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full peer-data-[state=checked]:border-primary">
                    {selectedPlan === plan && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{details.name}</span>
                      {details.popular && <Badge variant="secondary">Most Popular</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{details.includedSeats} team members included</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${price}/mo</div>
                  {details.launchPrice && (
                    <div className="text-xs text-muted-foreground line-through">${details.price}/mo</div>
                  )}
                </div>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

function SeatSelector({
  plan,
  additionalSeats,
  onSeatsChange,
}: { plan: PlanType; additionalSeats: number; onSeatsChange: (seats: number) => void }) {
  const planDetails = PLAN_DETAILS[plan]
  const totalSeats = planDetails.includedSeats + additionalSeats

  return (
    <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {planDetails.includedSeats} included, ${planDetails.additionalSeatPrice}/mo per additional seat
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold">{totalSeats} total seats</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSeatsChange(Math.max(0, additionalSeats - 1))}
          disabled={additionalSeats === 0}
        >
          -
        </Button>
        <div className="flex-1 text-center">
          <span className="font-medium">{additionalSeats}</span> additional seats
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onSeatsChange(additionalSeats + 1)}>
          +
        </Button>
      </div>
    </div>
  )
}

function PaymentForm({ signupData, initialPlan }: { signupData: any; initialPlan: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan as PlanType)
  const [additionalSeats, setAdditionalSeats] = useState(0)
  const [includeSocialMedia, setIncludeSocialMedia] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      console.log("[v0] Submitting payment form")

      const { error: submitError } = await elements.submit()
      if (submitError) {
        console.error("[v0] Submit error:", submitError)
        setErrorMessage(submitError.message || "An error occurred")
        setIsProcessing(false)
        return
      }

      console.log("[v0] Confirming setup")

      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })

      if (confirmError) {
        console.error("[v0] Confirm error:", confirmError)
        setErrorMessage(confirmError.message || "Payment setup failed")
        setIsProcessing(false)
        return
      }

      console.log("[v0] Setup confirmed, creating tenant")

      const response = await fetch("/api/signup/create-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signupData,
          plan: selectedPlan,
          additionalSeats,
          includeSocialMedia: selectedPlan === "starter" ? includeSocialMedia : false,
          paymentMethodId: setupIntent.payment_method,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] Tenant creation error:", data)
        throw new Error(data.error || "Failed to create account")
      }

      console.log("[v0] Tenant created successfully, redirecting")

      router.push(`/signup/success?tenant_id=${data.tenantId}`)
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      setErrorMessage(error.message || "An error occurred")
      setIsProcessing(false)
    }
  }

  const planDetails = PLAN_DETAILS[selectedPlan]
  const basePlanPrice = planDetails.launchPrice || planDetails.price
  const additionalSeatsPrice = additionalSeats * planDetails.additionalSeatPrice
  const socialMediaPrice = selectedPlan === "starter" && includeSocialMedia ? ADDON_DETAILS.socialMedia.price : 0
  const totalMonthlyPrice = basePlanPrice + additionalSeatsPrice + socialMediaPrice

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PlanSelector selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} />

      <SeatSelector plan={selectedPlan} additionalSeats={additionalSeats} onSeatsChange={setAdditionalSeats} />

      {selectedPlan === "starter" && (
        <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <Checkbox
              id="social-media"
              checked={includeSocialMedia}
              onCheckedChange={(checked) => setIncludeSocialMedia(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="social-media" className="font-semibold cursor-pointer">
                Add Social Media Posting (+$14/mo)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule and publish posts to Facebook, Instagram, and other platforms
              </p>
              <ul className="mt-2 space-y-1">
                {ADDON_DETAILS.socialMedia.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Badge variant="secondary" className="mt-2">
                Included in Growth & Enterprise
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-bold">$14</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium capitalize">{planDetails.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base price ({planDetails.includedSeats} seats)</span>
            <span>${basePlanPrice.toFixed(2)}/mo</span>
          </div>
          {additionalSeats > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Additional seats ({additionalSeats})</span>
              <span>${additionalSeatsPrice.toFixed(2)}/mo</span>
            </div>
          )}
          {selectedPlan === "starter" && includeSocialMedia && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Social Media Posting</span>
              <span>${socialMediaPrice.toFixed(2)}/mo</span>
            </div>
          )}
          {planDetails.launchPrice && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>30% launch discount applied</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Monthly Total</span>
            <span>${totalMonthlyPrice.toFixed(2)}/month</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>7-day free trial</span>
            <span>$0.00</span>
          </div>
          <div className="pt-4 border-t flex justify-between font-bold text-lg">
            <span>Due Today</span>
            <span>$0.00</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            You'll be charged ${totalMonthlyPrice.toFixed(2)} after your 7-day trial ends
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Payment Information</h3>
        <PaymentElement />
      </div>

      {errorMessage && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{errorMessage}</div>}

      <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={!stripe || isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Start Free Trial"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment method will be securely stored. You can cancel anytime during your trial.
      </p>
    </form>
  )
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "growth"
  const [signupData, setSignupData] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState("")

  useEffect(() => {
    const data = sessionStorage.getItem("signupData")
    if (data) {
      const parsed = JSON.parse(data)
      setSignupData(parsed)

      console.log("[v0] Creating setup intent for plan:", plan)

      fetch("/api/signup/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.email, plan }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("[v0] Setup intent created")
          setClientSecret(data.clientSecret)
        })
        .catch((error) => {
          console.error("[v0] Error creating setup intent:", error)
        })
    }
  }, [plan])

  if (!signupData || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                Step 2 of 2
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Complete your setup</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Choose your plan and add your payment method to start your free trial
              </p>
            </div>

            <Card className="p-8">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm signupData={signupData} initialPlan={plan} />
              </Elements>
            </Card>

            <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">7-Day Free Trial</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">Cancel Anytime</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
