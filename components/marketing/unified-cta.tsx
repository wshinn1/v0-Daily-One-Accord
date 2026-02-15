import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UnifiedCTA() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            Faithful Stewardship Starts with Unified Operations
          </h2>
          <p className="text-xl mb-8 text-blue-100 text-pretty">
            Stop wasting time managing disconnected tools. Unify your church operations and focus on what matters
            most—advancing God's kingdom. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="https://www.dailyoneaccord.com/waitlist">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
