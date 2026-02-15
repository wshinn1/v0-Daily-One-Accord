"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "growth"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    church: "",
    address: "",
    position: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store form data in session storage for the payment page
    sessionStorage.setItem("signupData", JSON.stringify({ ...formData, plan }))

    // Redirect to payment page
    router.push(`/signup/payment?plan=${plan}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const planNames: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    enterprise: "Enterprise",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                {planNames[plan]} Plan
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Start your 7-day free trial</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                No credit card required. Get full access to all features.
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@church.org"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="church">Church Name *</Label>
                  <Input
                    id="church"
                    name="church"
                    value={formData.church}
                    onChange={handleChange}
                    required
                    placeholder="First Community Church"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Church Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Your Position *</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    placeholder="Pastor, Administrator, etc."
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Continue to Payment"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    You won't be charged until after your 7-day free trial ends
                  </p>
                </div>
              </form>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                By signing up, you agree to our{" "}
                <a href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
