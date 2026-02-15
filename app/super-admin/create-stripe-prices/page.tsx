"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export default function CreateStripePricesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    growthPriceId?: string
    socialMediaPriceId?: string
    error?: string
  } | null>(null)

  const createPrices = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/create-stripe-prices", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Stripe Prices</CardTitle>
          <CardDescription>
            Create the new Growth plan ($89/month) and Social Media add-on ($14/month) prices in Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createPrices} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Prices...
              </>
            ) : (
              "Create Stripe Prices"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold">Prices created successfully!</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Growth Plan $89 Price ID:</strong>
                        <br />
                        <code className="bg-muted px-2 py-1 rounded">{result.growthPriceId}</code>
                      </p>
                      <p>
                        <strong>Social Media Add-on $14 Price ID:</strong>
                        <br />
                        <code className="bg-muted px-2 py-1 rounded">{result.socialMediaPriceId}</code>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Copy these price IDs and send them to v0 to update the config.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Error creating prices</p>
                    <p className="text-sm mt-1">{result.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
