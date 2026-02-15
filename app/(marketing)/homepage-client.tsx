"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  FolderOpen,
  Shield,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  TrendingDown,
  X,
  CreditCard,
  AlertCircle,
  Smartphone,
  Workflow,
} from "lucide-react"
import { VideoBackground } from "@/components/video-background"

function useAnimatedCounter(end: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, shouldStart])

  return count
}

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1, ...options },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isInView] as const
}

export function HomePageClient() {
  const [heroRef, heroInView] = useInView()
  const [problemRef, problemInView] = useInView()
  const [solutionRef, solutionInView] = useInView()
  const [uxRef, uxInView] = useInView()
  const [featuresRef, featuresInView] = useInView()
  const [analyticsRef, analyticsInView] = useInView()
  const [securityRef, securityInView] = useInView()
  const [integrationsRef, integrationsInView] = useInView()
  const [savingsRef, savingsInView] = useInView()
  const [comparisonRef, comparisonInView] = useInView()
  const [givingRef, givingInView] = useInView()
  const [ctaRef, ctaInView] = useInView()

  const savingsPercent = useAnimatedCounter(60, 2000, savingsInView)
  const annualSavings = useAnimatedCounter(2400, 2000, savingsInView)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative py-4 md:py-8 overflow-hidden transition-all duration-1000 ${
          heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <VideoBackground src="https://cdn.muse.ai/u/rtetL7B/aa3417121af094aae328c998d5cbd2f2c92b2b1fe99f2360225119b4e890ba3d/videos/video-720p.mp4" />

        <div className="absolute inset-0 bg-white/70" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-2 animate-in fade-in slide-in-from-top duration-700">
              <Image
                src="/images/logo.png"
                alt="Daily One Accord"
                width={600}
                height={200}
                className="h-48 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <Badge
              variant="secondary"
              className="mb-2 bg-white/90 dark:bg-gray-900/90 animate-in fade-in slide-in-from-top duration-700 delay-100"
            >
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Launching Soon - Early Access Available
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3 text-balance text-gray-900 dark:text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              Stop juggling apps. <span className="text-primary">Start building unity.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-white/90 mb-2 leading-relaxed text-pretty max-w-3xl mx-auto drop-shadow-md animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              One platform. One source of truth. Modern, intuitive interface that eliminates fragmentation and drives
              church growth.
            </p>
            <p className="text-lg text-gray-600 dark:text-white/80 mb-4 max-w-2xl mx-auto drop-shadow-sm animate-in fade-in slide-in-from-bottom duration-700 delay-400">
              Built with the latest technology for a fast, responsive experience on any device. No more outdated
              interfaces or steep learning curves.
            </p>
            <div className="flex justify-center mb-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 hover:scale-105 transition-transform duration-300"
              >
                💰 Churches save $840-$26,250/year with FREE Slack (nonprofit discount)
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-600">
              <Button size="lg" asChild className="text-lg h-12 px-8 hover:scale-105 transition-transform duration-300">
                <Link href="https://www.dailyoneaccord.com/waitlist">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg h-12 px-8 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 hover:scale-105 transition-transform duration-300"
              >
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section
        ref={problemRef}
        className={`py-12 md:py-20 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/10 transition-all duration-1000 ${
          problemInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                The Hidden Cost of Fragmented Church Communication
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Most churches don't have a communication problem—they have a <strong>FRAGMENTATION problem</strong>.
              </p>
            </div>

            {/* Real-world scenario */}
            <div className="max-w-3xl mx-auto mb-8 p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 hover:shadow-lg transition-shadow duration-300">
              <p className="text-muted-foreground italic">
                Picture this: Your worship leader posts the service plan in Slack. Your admin emails it to volunteers.
                Your pastor texts last-minute changes. Your tech team checks three different places to find the right
                information. By Sunday morning, nobody's on the same page.
              </p>
              <p className="text-muted-foreground font-semibold mt-4">
                This isn't just inefficient—it's organizationally destructive.
              </p>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-center">The Fragmentation Crisis:</h3>

            {/* Expanded pain points grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Communication Breakdown
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Staff spend 15-20 hours/week coordinating across platforms</li>
                  <li>• Critical information gets lost between systems</li>
                  <li>• Teams operate in silos, unaware of what others are doing</li>
                  <li>• Volunteers miss updates because they're in the "wrong" channel</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Zero Accountability
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No single source of truth for who's responsible for what</li>
                  <li>• Tasks fall through the cracks between platforms</li>
                  <li>• Follow-up becomes impossible when data lives in 7 different places</li>
                  <li>• Leadership can't see the full picture of ministry operations</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Growth Paralysis
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• New staff/volunteers face a learning curve across multiple tools</li>
                  <li>• Scaling requires adding MORE tools, creating MORE fragmentation</li>
                  <li>• Decision-making slows to a crawl as teams hunt for information</li>
                  <li>• Ministry momentum dies in the gap between disconnected systems</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Financial Drain
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• $5,000-$20,000 annually on fragmented subscriptions</li>
                  <li>• Hidden costs: Slack ($840-$26,250/year), email tools, SMS platforms</li>
                  <li>• Staff burnout from coordination overhead</li>
                  <li>• Lost giving opportunities from poor visitor follow-up</li>
                </ul>
              </Card>
            </div>

            {/* Bottom line callout */}
            <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-xl mb-3 text-center">The Bottom Line:</h4>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                Fragmented communication doesn't just waste time—it <strong>prevents growth</strong>. When your team
                spends more time coordinating than executing, ministry suffers. When information lives in silos,
                accountability disappears. When systems don't talk to each other, your church can't scale.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section
        ref={solutionRef}
        className={`py-12 md:py-20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/10 transition-all duration-1000 ${
          solutionInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                From Fragmentation to Unity: The Daily One Accord Solution
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-8">
                Daily One Accord doesn't just consolidate tools—it creates <strong>COHESIVE COMMUNICATION</strong> that
                builds growth and accountability.
              </p>
            </div>

            {/* The Unity Framework */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3">1. One Platform, One Truth</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• All communication flows through a single, unified system</li>
                  <li>• Slack integration means teams work where they already are</li>
                  <li>• Real-time updates ensure everyone sees the same information</li>
                  <li>• No more "I didn't get that email" or "I didn't see that message"</li>
                </ul>
              </Card>

              <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3">2. Built-In Accountability</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Every task has an owner, visible to the entire team</li>
                  <li>• Kanban boards show exactly who's responsible for what</li>
                  <li>• Automated Slack notifications keep teams on track</li>
                  <li>• Leadership dashboard provides real-time visibility into all operations</li>
                </ul>
              </Card>

              <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3">3. Communication That Scales</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• New team members onboard in hours, not weeks</li>
                  <li>• Volunteers get exactly the information they need, when they need it</li>
                  <li>• Multi-channel notifications (Slack, email, SMS) ensure nothing falls through cracks</li>
                  <li>• As your church grows, communication stays unified—not more fragmented</li>
                </ul>
              </Card>

              <Card className="p-6 border-l-4 border-l-orange-500 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <h4 className="font-bold text-lg mb-3">4. Growth-Focused Design</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Visitor management with automatic follow-up workflows</li>
                  <li>• Attendance tracking that triggers immediate Slack notifications</li>
                  <li>• Event coordination that keeps all stakeholders informed</li>
                  <li>• Service planning that ensures every team member knows their role</li>
                </ul>
              </Card>
            </div>

            {/* Results callout */}
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-900 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-2xl mb-4 text-center">The Result:</h4>
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <div className="flex items-start gap-3 hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">70% faster decision-making</div>
                    <div className="text-sm text-muted-foreground">Real-time visibility eliminates delays</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">90% reduction in "I didn't know" moments</div>
                    <div className="text-sm text-muted-foreground">Everyone stays informed automatically</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">15-20 hours/week saved</div>
                    <div className="text-sm text-muted-foreground">No more administrative coordination overhead</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 hover:scale-105 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Measurable improvement in follow-up</div>
                    <div className="text-sm text-muted-foreground">Automated workflows ensure nothing is missed</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern UX Comparison Section */}
      <section
        ref={uxRef}
        className={`py-12 md:py-20 bg-muted/30 transition-all duration-1000 ${
          uxInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                Modern Design
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Finally, church software that doesn't feel like it's from 2010
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Built with modern web technologies for a fast, intuitive experience. No more clunky interfaces or
                confusing navigation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-red-200 dark:border-red-900 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-lg">Traditional Church Software</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Outdated interfaces from the early 2000s</li>
                  <li>• Steep learning curve requiring extensive training</li>
                  <li>• Slow page loads and clunky navigation</li>
                  <li>• Poor mobile experience (if any)</li>
                  <li>• Inconsistent design across modules</li>
                  <li>• Requires IT support for basic tasks</li>
                </ul>
              </Card>

              <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-lg">Daily One Accord</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Modern, clean interface built with latest web tech</li>
                  <li>• Intuitive design—start using in minutes, not weeks</li>
                  <li>• Lightning-fast performance on any device</li>
                  <li>• Mobile-first responsive design</li>
                  <li>• Consistent, cohesive experience throughout</li>
                  <li>• Self-service with contextual help everywhere</li>
                </ul>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                <strong>Result:</strong> Your team spends less time learning software and more time doing ministry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        ref={featuresRef}
        className={`py-12 md:py-20 transition-all duration-1000 ${
          featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Everything you need to manage your church
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Powerful features designed to help you focus on what matters most - your community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Member Management",
                desc: "Track attendance, manage member profiles, and keep your congregation connected.",
              },
              {
                icon: Calendar,
                title: "Event Planning",
                desc: "Schedule services, classes, and events with our intuitive calendar system.",
              },
              {
                icon: MessageSquare,
                title: "Communication Hub",
                desc: "Send SMS, emails, and Slack messages to keep everyone informed and engaged.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Insights",
                desc: "Track growth, engagement, and trends with comprehensive analytics dashboards.",
              },
              {
                icon: FolderOpen,
                title: "Digital Asset Management",
                desc: "Organize and access your media files, documents, and resources in one central location.",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security with automatic backups and 99.9% uptime guarantee.",
              },
              {
                icon: Users,
                title: "Volunteer Management",
                desc: "Schedule teams, track certifications, manage recurring roles, and coordinate volunteers across all ministries.",
              },
              {
                icon: Workflow,
                title: "Custom Workflows",
                desc: "Build automated workflows for visitor follow-up, member onboarding, and event coordination with our Unity Kanban boards.",
              },
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                desc: "Fully responsive interface optimized for phones and tablets. Manage your church from anywhere, on any device.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics & Reporting Section */}
      <section
        ref={analyticsRef}
        className={`py-12 md:py-20 bg-muted/30 transition-all duration-1000 ${
          analyticsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Powerful Analytics
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                  Make data-driven decisions with real-time insights
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Track attendance trends, engagement metrics, giving patterns, and ministry health with customizable
                  dashboards and exportable reports.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      title: "Real-Time Dashboards",
                      desc: "See attendance, engagement, and giving metrics updated in real-time. No more waiting for weekly reports.",
                    },
                    {
                      title: "Customizable Reports",
                      desc: "Build custom reports for your board, staff, or ministry leaders. Export to Excel, PDF, or share via link.",
                    },
                    {
                      title: "Trend Analysis",
                      desc: "Identify growth patterns, seasonal trends, and areas needing attention with visual charts and graphs.",
                    },
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 hover:scale-105 transition-transform duration-300"
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">{item.title}</div>
                        <div className="text-muted-foreground">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border bg-muted/30 flex items-center justify-center hover:scale-105 transition-transform duration-500">
                  <div className="text-center p-8">
                    <BarChart3 className="h-24 w-24 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Analytics Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section
        ref={securityRef}
        className={`py-12 md:py-20 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/10 transition-all duration-1000 ${
          securityInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise-Grade Security
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Your data is secure, private, and always yours
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Built on Supabase with Row-Level Security, encrypted at rest and in transit, with automatic backups and
                99.9% uptime SLA.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  color: "blue",
                  title: "Bank-Level Encryption",
                  desc: "All data encrypted at rest (AES-256) and in transit (TLS 1.3). Row-Level Security ensures members only see what they're authorized to access.",
                },
                {
                  icon: CheckCircle2,
                  color: "green",
                  title: "You Own Your Data",
                  desc: "Export your complete database anytime in standard formats. No vendor lock-in. Your data belongs to you, not us.",
                },
                {
                  icon: BarChart3,
                  color: "purple",
                  title: "SOC 2 Compliance Path",
                  desc: "Built on infrastructure that meets SOC 2 Type II standards. Automatic backups, audit logs, and enterprise-grade reliability.",
                },
              ].map((item, index) => (
                <Card key={index} className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-${item.color}-500/10 flex items-center justify-center mb-4`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Trusted by churches to protect sensitive member information, financial data, and pastoral records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Integrations Section */}
      <section
        ref={integrationsRef}
        className={`py-12 md:py-20 transition-all duration-1000 ${
          integrationsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border hover:scale-105 transition-transform duration-500">
                <img
                  src="/modern-church-communication-dashboard-with-slack-i.jpg"
                  alt="Unified Communication Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">
                <MessageSquare className="h-3 w-3 mr-1" />
                Communication That Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Deep integrations with the tools you already use
              </h2>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Daily One Accord connects seamlessly with Slack, Stripe, Google Drive, Zoom, and more. Your data flows
                automatically between systems—no manual exports or imports.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: MessageSquare, label: "Slack" },
                  { icon: CreditCard, label: "Stripe" },
                  { icon: FolderOpen, label: "Google Drive" },
                  { icon: Calendar, label: "Zoom" },
                  { icon: MessageSquare, label: "SMS (Telnyx)" },
                  { icon: MessageSquare, label: "Email (Resend)" },
                ].map((integration, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm px-4 py-2 hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                  >
                    <integration.icon className="h-4 w-4 mr-2" />
                    {integration.label}
                  </Badge>
                ))}
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: "Slack Integration",
                    desc: "Send service rundowns, attendance updates, and announcements directly to your Slack channels. Your team stays informed without leaving their workflow.",
                  },
                  {
                    title: "Multi-Channel Messaging",
                    desc: "Reach members through SMS, email, Slack, and GroupMe from one dashboard. Send the right message through the right channel, every time.",
                  },
                  {
                    title: "Centralized Communication Hub",
                    desc: "Track all conversations, notifications, and updates in one place. Never miss a message or lose important information across multiple platforms.",
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 hover:scale-105 transition-transform duration-300">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Savings Section */}
      <section
        ref={savingsRef}
        className={`py-12 md:py-20 bg-muted/30 transition-all duration-1000 ${
          savingsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <DollarSign className="h-3 w-3 mr-1" />
              Cost Savings
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Save thousands compared to other church management systems
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Get more features for less. Daily One Accord replaces multiple expensive tools with one affordable
              platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">{savingsPercent}%</div>
              <div className="font-semibold mb-2">Lower Cost</div>
              <p className="text-sm text-muted-foreground">
                Save up to 60% compared to traditional church management systems like Planning Center or Church
                Community Builder
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">${annualSavings.toLocaleString()}+</div>
              <div className="font-semibold mb-2">Annual Savings</div>
              <p className="text-sm text-muted-foreground">
                Average church saves over $2,400 per year by consolidating multiple tools into Daily One Accord
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-2">All-in-One</div>
              <div className="font-semibold mb-2">Replace 5+ Tools</div>
              <p className="text-sm text-muted-foreground">
                Eliminate separate subscriptions for messaging, scheduling, media storage, analytics, and more
              </p>
            </Card>
          </div>

          <Card className="p-8 mt-8 bg-muted/50">
            <h3 className="text-2xl font-bold mb-4 text-center">What You're Replacing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Church Management System ($50-150/mo)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">SMS Service ($20-50/mo)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Email Marketing ($15-30/mo)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Media Storage ($10-20/mo)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Analytics Tools ($20-40/mo)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Scheduling Software ($15-25/mo)</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-lg mb-2">
                Total: <span className="line-through text-muted-foreground">$130-315/month</span>
              </p>
              <p className="text-2xl font-bold text-primary">Daily One Accord: Starting at $24/month</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
                Save $106-291 per month = $1,272-$3,492 per year
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Plus FREE Slack (saves additional $840-$26,250/year with nonprofit discount)
              </p>
            </div>
          </Card>

          <Card className="p-6 mt-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Hidden Costs You're Not Seeing
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-2">Staff Time Waste</div>
                <p className="text-muted-foreground">
                  15-20 hours/week coordinating across platforms = $15,600-$20,800/year in lost productivity (at $20/hr)
                </p>
              </div>
              <div>
                <div className="font-semibold mb-2">Training & Onboarding</div>
                <p className="text-muted-foreground">
                  Complex systems require extensive training. New volunteers take weeks to get up to speed across
                  multiple tools.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-2">Lost Giving Opportunities</div>
                <p className="text-muted-foreground">
                  Poor visitor follow-up due to fragmented data means missed connections and lost potential
                  members/givers.
                </p>
              </div>
              <div>
                <div className="font-semibold mb-2">Staff Burnout</div>
                <p className="text-muted-foreground">
                  Coordination overhead and tool-switching fatigue leads to burnout and turnover—expensive to replace
                  staff.
                </p>
              </div>
            </div>
            <p className="text-center mt-4 font-semibold text-yellow-800 dark:text-yellow-200">
              Daily One Accord eliminates these hidden costs by unifying everything in one platform
            </p>
          </Card>
        </div>
      </section>

      {/* Cost Savings Comparison Table */}
      <section
        ref={comparisonRef}
        className={`py-12 bg-gradient-to-b from-primary/5 to-transparent transition-all duration-1000 ${
          comparisonInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <DollarSign className="h-3 w-3 mr-1" />
                Cost Comparison
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Save thousands with Daily One Accord</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                See how Daily One Accord compares to traditional church management systems and the tools you're
                currently using.
              </p>
            </div>

            {/* Comparison Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">
                        <div className="flex flex-col items-center gap-2">
                          <span>Daily One Accord</span>
                          <Badge variant="default" className="text-xs">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold">Planning Center</th>
                      <th className="text-center p-4 font-semibold">Church Community Builder</th>
                      <th className="text-center p-4 font-semibold">Breeze ChMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4 font-medium">Member Management</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Event Scheduling</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">SMS Messaging</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Extra cost</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Extra cost</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Extra cost</span>
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Slack Integration</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Digital Asset Management</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Limited</span>
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Social Media Scheduling</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Advanced Analytics</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Extra cost</span>
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs text-muted-foreground">Limited</span>
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Mobile App</td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="p-4 text-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-t-2 border-primary/20">
                      <td className="p-4 font-bold text-lg">Starting Price</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-2xl text-primary">$24</div>
                        <div className="text-xs text-muted-foreground mt-1">per month</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-2xl">$69</div>
                        <div className="text-xs text-muted-foreground mt-1">per month</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-2xl">$89</div>
                        <div className="text-xs text-muted-foreground mt-1">per month</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-2xl">$72</div>
                        <div className="text-xs text-muted-foreground mt-1">per month</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* What You're Replacing */}
            <Card className="p-8 mt-8 bg-muted/50">
              <h3 className="text-2xl font-bold mb-6 text-center">What Daily One Accord Replaces</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Church Management System</div>
                    <div className="text-sm text-muted-foreground">$50-150/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">SMS Service (Twilio, etc.)</div>
                    <div className="text-sm text-muted-foreground">$20-50/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Email Marketing (Mailchimp)</div>
                    <div className="text-sm text-muted-foreground">$15-30/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Media Storage (Dropbox, Google)</div>
                    <div className="text-sm text-muted-foreground">$10-20/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Social Media Tools (Buffer)</div>
                    <div className="text-sm text-muted-foreground">$15-25/month</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Analytics & Reporting</div>
                    <div className="text-sm text-muted-foreground">$20-40/month</div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t text-center">
                <p className="text-lg mb-2">
                  <span className="font-semibold">Total with separate tools:</span>{" "}
                  <span className="line-through text-muted-foreground">$130-315/month</span>
                </p>
                <p className="text-2xl font-bold text-primary">Daily One Accord: Starting at $24/month</p>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
                  Save $106-291 per month = $1,272-$3,492 per year
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Plus FREE Slack (saves additional $840-$26,250/year with nonprofit discount)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Giving System Section */}
      <section
        ref={givingRef}
        className={`py-12 md:py-20 transition-all duration-1000 ${
          givingInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <CreditCard className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Customizable Giving System with Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
                Accept tithes and offerings with a fully customizable giving platform that integrates directly into your
                accounting system. Complete transparency on transaction fees with minimal markup.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fully Customizable</h3>
                <p className="text-sm text-muted-foreground">
                  Add and edit giving categories to match your church's needs. Customize branding, colors, and messaging
                  to reflect your organization's identity.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accounting Integration</h3>
                <p className="text-sm text-muted-foreground">
                  All donations flow directly into your accounting system with proper categorization. Track tithes,
                  offerings, missions, and special funds automatically.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  We're upfront about our markup. Most fees go directly to Stripe for payment processing. No hidden
                  costs or surprise charges.
                </p>
              </Card>
            </div>

            {/* Transaction Fee Transparency */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-900 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold mb-6 text-center">Transaction Fee Transparency</h3>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Unlike other platforms that hide their markup, we're completely transparent about where your money goes.
                Most of the transaction fee goes directly to Stripe for secure payment processing.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary mb-2">2.9%</div>
                  <div className="font-semibold mb-2">Starter Plan</div>
                  <div className="text-sm text-muted-foreground mb-4">Total transaction fee</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stripe's fee:</span>
                      <span className="font-medium">2.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Our markup:</span>
                      <span className="font-medium text-primary">0.1%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">On $8,000/month giving, we keep only $96/year</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary mb-2">2.9%</div>
                  <div className="font-semibold mb-2">Growth Plan</div>
                  <div className="text-sm text-muted-foreground mb-4">Total transaction fee</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stripe's fee:</span>
                      <span className="font-medium">2.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Our markup:</span>
                      <span className="font-medium text-primary">0.1%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">On $8,000/month giving, we keep only $96/year</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-bold text-primary mb-2">2.2%</div>
                  <div className="font-semibold mb-2">Enterprise Plan</div>
                  <div className="text-sm text-muted-foreground mb-4">Total transaction fee</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stripe's fee:</span>
                      <span className="font-medium">2.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Our markup:</span>
                      <span className="font-medium text-green-600">$0</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-4">
                    Nonprofit rate with zero markup
                  </p>
                </div>
              </div>
            </Card>

            {/* Giving System Cost Comparison */}
            <Card className="overflow-hidden">
              <div className="bg-muted/50 p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Giving System Cost Comparison</h3>
                <p className="text-muted-foreground">
                  See how Daily One Accord's giving system compares to standalone platforms
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left p-4 font-semibold">Platform</th>
                      <th className="text-center p-4 font-semibold">Transaction Fee</th>
                      <th className="text-center p-4 font-semibold">Monthly Fee</th>
                      <th className="text-center p-4 font-semibold">Annual Cost ($8K/mo giving)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="bg-green-50 dark:bg-green-950/20">
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          Daily One Accord (Starter)
                          <Badge variant="default" className="text-xs">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-center font-medium">2.9%</td>
                      <td className="p-4 text-center font-medium">$24</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-primary text-lg">$3,060</div>
                        <div className="text-xs text-muted-foreground">$288 subscription + $2,772 fees</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Daily One Accord (Growth)</td>
                      <td className="p-4 text-center font-medium">2.9%</td>
                      <td className="p-4 text-center font-medium">$79</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-primary text-lg">$3,732</div>
                        <div className="text-xs text-muted-foreground">$948 subscription + $2,784 fees</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Planning Center Giving</td>
                      <td className="p-4 text-center">2.9%</td>
                      <td className="p-4 text-center">$69</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-lg">$3,612</div>
                        <div className="text-xs text-muted-foreground">$828 subscription + $2,784 fees</div>
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Tithe.ly</td>
                      <td className="p-4 text-center">2.9%</td>
                      <td className="p-4 text-center">$72-228</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-lg">$3,648-5,520</div>
                        <div className="text-xs text-muted-foreground">$864-2,736 subscription + $2,784 fees</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Pushpay</td>
                      <td className="p-4 text-center">2.9%</td>
                      <td className="p-4 text-center">Custom</td>
                      <td className="p-4 text-center">
                        <div className="font-bold text-lg">$3,000+</div>
                        <div className="text-xs text-muted-foreground">Enterprise pricing</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Combined Savings */}
            <Card className="p-8 mt-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Combined Savings: Church Management + Giving System
              </h3>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                When you use Daily One Accord for both church management and giving, you save even more by eliminating
                multiple subscriptions and reducing administrative overhead.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 text-center">Traditional Setup</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Church Management (Planning Center):</span>
                      <span className="font-medium">$1,200/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giving Platform (Tithe.ly):</span>
                      <span className="font-medium">$228/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Fees (2.9%):</span>
                      <span className="font-medium">$2,784/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SMS Service:</span>
                      <span className="font-medium">$300/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Marketing:</span>
                      <span className="font-medium">$240/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Media Storage:</span>
                      <span className="font-medium">$180/yr</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between font-bold text-lg">
                      <span>Total Annual Cost:</span>
                      <span>$4,932</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-primary">
                  <h4 className="font-semibold mb-4 text-center flex items-center justify-center gap-2">
                    Daily One Accord (All-in-One)
                    <Badge variant="default">Best Value</Badge>
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription (Starter):</span>
                      <span className="font-medium">$288/yr</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>SMS Included:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Email Included:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Media Storage Included:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Giving System Included:</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>FREE Slack (nonprofit discount):</span>
                      <span className="font-medium">$0 (saves $840/yr)</span>
                    </div>
                    <div className="pt-3 border-t flex justify-between font-bold text-lg text-primary">
                      <span>Total Annual Cost:</span>
                      <span>$288</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 bg-green-100 dark:bg-green-900/30 rounded-lg px-6 py-4">
                  <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">Save $4,644/year</div>
                    <div className="text-sm text-muted-foreground">94% cost reduction with all features included</div>
                    <div className="text-xs text-muted-foreground mt-1">Plus $840/year saved with FREE Slack</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`py-12 md:py-20 bg-gradient-to-br from-primary/5 to-primary/10 transition-all duration-1000 ${
          ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Join <strong>100+ churches</strong> on the waitlist
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>7-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              Ready to transform your church management?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              Join the waitlist today and be among the first to experience the future of church management software.
            </p>
            <Button
              size="lg"
              asChild
              className="text-lg h-12 px-8 hover:scale-110 transition-transform duration-300 animate-in fade-in slide-in-from-bottom duration-700 delay-400"
            >
              <Link href="/waitlist">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
