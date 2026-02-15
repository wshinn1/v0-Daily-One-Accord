import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Lightbulb, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Product Roadmap - What's Coming Next",
  description:
    "See what features we're building for Daily One Accord. View recently shipped features, work in progress, and planned updates. Your feedback shapes our roadmap.",
  keywords: ["product roadmap", "upcoming features", "church software updates", "feature requests"],
  openGraph: {
    title: "Product Roadmap | Daily One Accord",
    description: "See what features we're building for Daily One Accord and help shape our future.",
    type: "website",
    url: "/roadmap",
  },
  alternates: {
    canonical: "/roadmap",
  },
}

export default function RoadmapPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Product Roadmap
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Building the future together</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              See what we're working on and what's coming next. Your feedback shapes our roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Planned */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Planned</h2>
                  <p className="text-sm text-muted-foreground">Features on our roadmap for future development</p>
                </div>
              </div>

              <div className="space-y-4 ml-5 border-l-2 border-muted pl-8">
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">Custom Mobile App</h3>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">Mobile App Access for Daily One Accord</p>
                  <p className="text-sm text-muted-foreground">Planned: Q4 2025</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">Advanced Workflow Automation</h3>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    Build custom workflows with triggers, conditions, and actions to automate complex processes unique
                    to your church.
                  </p>
                  <p className="text-sm text-muted-foreground">Planned: Q4 2025</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">Sermon Management & Archive</h3>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    Upload, organize, and share sermons with automatic transcription, searchable content, and podcast
                    distribution.
                  </p>
                  <p className="text-sm text-muted-foreground">Planned: Q4 2025</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">Kids Check-In System</h3>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    Secure check-in/check-out system for children's ministry with parent notifications, allergy alerts,
                    and room capacity management.
                  </p>
                  <p className="text-sm text-muted-foreground">Planned: Q4 2025</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Help shape our roadmap</h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Your feedback is invaluable. Let us know what features would help your church the most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link href="/contact">
                  Submit Feedback
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
