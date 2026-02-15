"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get("tenant_id")

  useEffect(() => {
    // Clear signup data from session storage
    sessionStorage.removeItem("signupData")
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Welcome to Daily One Accord!</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Your church management account has been successfully created.
            </p>

            <Card className="p-8 text-left mb-8">
              <h2 className="text-2xl font-bold mb-4">What happens next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Check your email</h3>
                    <p className="text-muted-foreground">
                      We've sent you a confirmation email with your login credentials and next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Onboarding call scheduled</h3>
                    <p className="text-muted-foreground">
                      Our team will reach out within 24 hours to schedule a personalized onboarding call. We'll walk you
                      through the system and answer any questions you have.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Start exploring</h3>
                    <p className="text-muted-foreground">
                      You have full access to all features during your 7-day free trial. Start adding team members,
                      importing data, and exploring the platform.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link href="/login">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@dailyoneaccord.com" className="underline hover:text-foreground">
                support@dailyoneaccord.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
