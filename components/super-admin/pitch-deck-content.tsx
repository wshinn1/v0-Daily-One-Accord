"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Presentation } from "lucide-react"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    title: "Daily One Accord",
    subtitle: "Unifying Church Operations",
    content: (
      <div className="space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">Daily One Accord</h1>
          <p className="text-2xl text-muted-foreground">Unifying Church Operations</p>
        </div>
        <div className="pt-8 space-y-2">
          <p className="text-lg font-semibold">All-in-One Church Management Platform</p>
          <p className="text-sm text-muted-foreground">Replacing 5-10 Disconnected Tools</p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "Church Operational Chaos",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">The Problem</h2>
        <div className="grid gap-6">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Fragmented Tools</h3>
              <p className="text-muted-foreground">
                Churches juggle 5-10 disconnected platforms for attendance, giving, communications, and team management
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Wasted Resources</h3>
              <p className="text-muted-foreground">
                Average church spends $500-$2,000/month on multiple subscriptions with duplicate functionality
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Communication Breakdown</h3>
              <p className="text-muted-foreground">
                Information scattered across platforms leads to missed updates and operational inefficiency
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "The Solution",
    subtitle: "Unified Platform",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">The Solution</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Attendance Tracking</h3>
              <p className="text-sm text-muted-foreground">Real-time check-ins with Slack notifications</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Integrated Giving</h3>
              <p className="text-sm text-muted-foreground">Stripe Connect - churches keep 97.1%</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Communications</h3>
              <p className="text-sm text-muted-foreground">SMS, email, and Slack in one place</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Team Management</h3>
              <p className="text-sm text-muted-foreground">Service rundowns and class coordination</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Event Planning</h3>
              <p className="text-sm text-muted-foreground">Calendar and scheduling tools</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">✓ Biblical Stewardship</h3>
              <p className="text-sm text-muted-foreground">Built with ministry principles at core</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Market Opportunity",
    subtitle: "$1.8B+ Addressable Market",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">Market Opportunity</h2>
        <div className="grid gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">300,000+</p>
                <p className="text-lg text-muted-foreground">Churches in the United States</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">$50B+</p>
                <p className="text-lg text-muted-foreground">Annual Church Giving</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">$1.8B+</p>
                <p className="text-lg text-muted-foreground">Addressable Software Market</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Business Model",
    subtitle: "Predictable SaaS Revenue",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">Business Model</h2>
        <div className="grid gap-4">
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-3">Tiered Subscriptions</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Starter:</strong> $24/month (3-10 Slack seats)
                </p>
                <p>
                  <strong>Growth:</strong> $79/month (3-20 Slack seats)
                </p>
                <p>
                  <strong>Enterprise:</strong> $199/month (unlimited seats)
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-3">Maintenance Fee</h3>
              <p className="text-sm text-muted-foreground">
                $99/month (all plans) - covers platform maintenance, security, support, and backups
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-3">Total Monthly Revenue Per Customer</h3>
              <div className="space-y-2 text-sm">
                <p>Starter: $123-$137/month</p>
                <p>Growth: $178/month</p>
                <p>Enterprise: $298/month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "Traction",
    subtitle: "Production-Ready Platform",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">Current Progress</h2>
        <div className="grid gap-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">✓ Platform Complete</h3>
              <p className="text-muted-foreground">
                Fully-built, production-ready SaaS platform live at dailyoneaccord.com with all core features functional
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">✓ Technical De-Risked</h3>
              <p className="text-muted-foreground">
                All engineering complete: Stripe Connect, Supabase database, Slack/SMS/email integrations, multi-tenant
                architecture
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">✓ Ready to Scale</h3>
              <p className="text-muted-foreground">
                Not seeking funding to build—seeking funding to scale customer acquisition. Product works and is ready
                to onboard churches immediately
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "Financial Projections",
    subtitle: "Path to $3.6M ARR",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">Financial Projections</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="border border-border p-3 text-left font-bold">Year</th>
                <th className="border border-border p-3 text-right font-bold">Revenue</th>
                <th className="border border-border p-3 text-right font-bold">Profit</th>
                <th className="border border-border p-3 text-right font-bold">Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-accent/50">
                <td className="border border-border p-3 font-semibold">2025</td>
                <td className="border border-border p-3 text-right">$240,000</td>
                <td className="border border-border p-3 text-right text-green-600">$120,000</td>
                <td className="border border-border p-3 text-right">50%</td>
              </tr>
              <tr className="hover:bg-accent/50">
                <td className="border border-border p-3 font-semibold">2026</td>
                <td className="border border-border p-3 text-right">$840,000</td>
                <td className="border border-border p-3 text-right text-green-600">$450,000</td>
                <td className="border border-border p-3 text-right">53%</td>
              </tr>
              <tr className="hover:bg-accent/50">
                <td className="border border-border p-3 font-semibold">2027</td>
                <td className="border border-border p-3 text-right">$1,800,000</td>
                <td className="border border-border p-3 text-right text-green-600">$1,070,000</td>
                <td className="border border-border p-3 text-right">59%</td>
              </tr>
              <tr className="hover:bg-accent/50">
                <td className="border border-border p-3 font-semibold">2028</td>
                <td className="border border-border p-3 text-right">$3,600,000</td>
                <td className="border border-border p-3 text-right text-green-600">$2,250,000</td>
                <td className="border border-border p-3 text-right">62%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Conservative projections based on $200/month average revenue per customer
        </p>
      </div>
    ),
  },
  {
    id: 8,
    title: "The Team",
    subtitle: "Faith-Driven Leadership",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">The Team</h2>
        <Card className="bg-accent/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Wes Shinn</h3>
                <p className="text-lg text-primary font-semibold mb-4">Co-Founder & CEO</p>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>17 years</strong> of professional experience as visual storyteller, photographer, and
                  filmmaker with film school education
                </p>
                <p>
                  <strong>Military photojournalism background</strong> - trained to remain calm under pressure and
                  capture intricate details
                </p>
                <p>
                  <strong>Faith-driven leader</strong> who spends daily time with God and understands church operations
                  from the inside
                </p>
                <p>
                  <strong>Proven execution</strong> - built entire production-ready platform with Stripe Connect,
                  Supabase, and multi-channel communications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-muted-foreground italic">
          "We're not just developers—we're faith-driven leaders committed to solving real church challenges"
        </p>
      </div>
    ),
  },
  {
    id: 9,
    title: "3-5 Year Vision",
    subtitle: "Path to $30M ARR",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">3-5 Year Vision</h2>
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">Year 1-2: Market Entry</h3>
              <p className="text-sm text-muted-foreground">
                Acquire 500-1,000 churches through digital marketing and church conferences. Establish brand presence.
                Target: $1.5M-$3M ARR
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">Year 3: Mobile & Partnerships</h3>
              <p className="text-sm text-muted-foreground">
                Launch mobile app (iOS/Android). Build strategic partnerships with major denominations. Expand to 2,500+
                churches. Target: $7M+ ARR
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">Year 4-5: Scale & International</h3>
              <p className="text-sm text-muted-foreground">
                Introduce workflow automation, sermon management, kids check-in. Expand internationally. Reach
                5,000-10,000 churches. Target: $15M-$30M ARR
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2">Exit Strategy</h3>
              <p className="text-sm text-muted-foreground">
                Position for acquisition by major church tech players (Planning Center, Pushpay, Faithlife) or continue
                as profitable SaaS business
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: 10,
    title: "Investment Opportunity",
    subtitle: "Seeking $150K-$300K Seed Round",
    content: (
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-center mb-8">Investment Opportunity</h2>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-2">$150,000 - $300,000</p>
              <p className="text-lg text-muted-foreground">Seed Investment</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">
                  <strong>15-20% equity</strong> in exchange for seed investment
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">
                  <strong>Pre-money valuation:</strong> $1M-$1.5M
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">
                  <strong>Use of funds:</strong> Customer acquisition, marketing, and sales team hiring
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-sm">
                  <strong>Structure:</strong> SAFE or convertible note with standard investor rights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-center pt-4">
          <p className="text-lg font-semibold mb-2">Why Invest Now?</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Platform is technically de-risked with all engineering complete. Investment accelerates customer acquisition
            in a proven $1.8B+ market. Fast time to ROI with capital-efficient execution.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 11,
    title: "Contact",
    subtitle: "Let's Build Together",
    content: (
      <div className="space-y-8 text-center">
        <h2 className="text-4xl font-bold mb-8">Let's Build Together</h2>
        <Card className="bg-accent/50 max-w-2xl mx-auto">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Daily One Accord</h3>
              <p className="text-muted-foreground">Unifying Church Operations</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Website:</strong>{" "}
                <a href="https://www.dailyoneaccord.com" className="text-primary hover:underline">
                  dailyoneaccord.com
                </a>
              </p>
              <p className="text-sm">
                <strong>Email:</strong>{" "}
                <a href="mailto:wes@dailyoneaccord.com" className="text-primary hover:underline">
                  wes@dailyoneaccord.com
                </a>
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                "Just as I build genuine connections to capture authentic stories, I'm committed to understanding the
                unique needs of each church we serve."
              </p>
              <p className="text-xs text-muted-foreground mt-2">- Wes Shinn, Co-Founder & CEO</p>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
]

export function PitchDeckContent() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Presentation className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Investor Pitch Deck</h1>
                <p className="text-sm text-muted-foreground">Daily One Accord</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Slide Display */}
        <Card className="mb-6">
          <CardContent className="p-12 min-h-[600px] flex flex-col justify-center">
            {slides[currentSlide].content}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          <Button variant="outline" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Slide Thumbnails */}
        <div className="grid grid-cols-6 gap-3 print:hidden">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "p-3 border rounded-lg text-left hover:bg-accent transition-colors",
                currentSlide === index ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <div className="text-xs font-semibold mb-1">Slide {index + 1}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{slide.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
