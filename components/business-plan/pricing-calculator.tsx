"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function PricingCalculator() {
  const [seats, setSeats] = useState(5)

  // Pricing logic
  const calculatePricing = (plan: "starter" | "growth" | "enterprise", seatCount: number) => {
    const basePrices = {
      starter: { base: 39, includedSeats: 3, perSeat: 8 },
      growth: { base: 89, includedSeats: 6, perSeat: 8 },
      enterprise: { base: 199, includedSeats: 20, perSeat: 8 },
    }

    const config = basePrices[plan]
    const additionalSeats = Math.max(0, seatCount - config.includedSeats)
    const total = config.base + additionalSeats * config.perSeat

    return {
      base: config.base,
      includedSeats: config.includedSeats,
      additionalSeats,
      additionalCost: additionalSeats * config.perSeat,
      total,
    }
  }

  const starterPricing = calculatePricing("starter", seats)
  const growthPricing = calculatePricing("growth", seats)
  const enterprisePricing = calculatePricing("enterprise", seats)

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Interactive Pricing Calculator</h2>
        <p className="text-muted-foreground">Adjust the slider to see how pricing changes with team size</p>

        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Number of Team Members:</span>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {seats} seats
            </Badge>
          </div>
          <Slider
            value={[seats]}
            onValueChange={(value) => setSeats(value[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 seat</span>
            <span>30 seats</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Starter Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Starter
              <Badge className="bg-blue-500">Most Affordable</Badge>
            </CardTitle>
            <CardDescription>Perfect for small churches getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold">${starterPricing.total}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base plan:</span>
                <span className="font-medium">${starterPricing.base}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Included seats:</span>
                <span className="font-medium">{starterPricing.includedSeats}</span>
              </div>
              {starterPricing.additionalSeats > 0 && (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>Additional seats ({starterPricing.additionalSeats}):</span>
                    <span className="font-medium">+${starterPricing.additionalCost}/mo</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Attendance tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Event calendar</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Basic reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Email support</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="text-sm">+ Social Media add-on available ($14/mo)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Plan */}
        <Card className="relative border-purple-500 border-2">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-purple-500">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Growth
              <Badge variant="outline">Best Value</Badge>
            </CardTitle>
            <CardDescription>For growing churches with active teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold">${growthPricing.total}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base plan:</span>
                <span className="font-medium">${growthPricing.base}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Included seats:</span>
                <span className="font-medium">{growthPricing.includedSeats}</span>
              </div>
              {growthPricing.additionalSeats > 0 && (
                <>
                  <div className="flex justify-between text-purple-600">
                    <span>Additional seats ({growthPricing.additionalSeats}):</span>
                    <span className="font-medium">+${growthPricing.additionalCost}/mo</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Everything in Starter</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Slack integration</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">SMS notifications</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm font-medium">Social media scheduling included</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Advanced reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Enterprise
              <Badge className="bg-amber-500">Full Featured</Badge>
            </CardTitle>
            <CardDescription>For large churches with complex needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-4xl font-bold">${enterprisePricing.total}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base plan:</span>
                <span className="font-medium">${enterprisePricing.base}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Included seats:</span>
                <span className="font-medium">{enterprisePricing.includedSeats}</span>
              </div>
              {enterprisePricing.additionalSeats > 0 && (
                <>
                  <div className="flex justify-between text-amber-600">
                    <span>Additional seats ({enterprisePricing.additionalSeats}):</span>
                    <span className="font-medium">+${enterprisePricing.additionalCost}/mo</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Everything in Growth</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm font-medium">Social media scheduling included</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Dedicated account manager</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Custom integrations</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Advanced security</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">24/7 phone support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a one-time $199 setup fee</p>
        <p className="mt-1">Additional seats are $8/month each beyond included seats</p>
      </div>
    </div>
  )
}
