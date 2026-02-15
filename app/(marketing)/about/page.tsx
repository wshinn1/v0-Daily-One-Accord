import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Target, Users, BookOpen, Camera, Globe, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import type { Metadata } from "next"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { RelatedPages } from "@/components/seo/related-pages"

export const metadata: Metadata = {
  title: "About Us - Built by Church Leaders, for Church Leaders",
  description:
    "Learn about Daily One Accord's mission to help churches focus on ministry, not administration. Founded by Wes Shinn and Keiko Chibana-Shinn with decades of ministry experience. Our biblical foundation and values guide everything we do.",
  keywords: [
    "about daily one accord",
    "church management company",
    "church software founders",
    "ministry technology",
    "church leadership tools",
  ],
  openGraph: {
    title: "About Us - Built by Church Leaders, for Church Leaders | Daily One Accord",
    description:
      "Learn about our mission to help churches focus on what matters most - building community and spreading their message.",
    type: "website",
    url: "/about",
  },
  alternates: {
    canonical: "/about",
  },
}

export default function AboutPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "About", url: "https://dailyoneaccord.com/about" },
  ]

  const relatedPages = [
    {
      title: "Our Features",
      description: "Discover all the tools we've built to help your church thrive.",
      href: "/features",
    },
    {
      title: "Pricing Plans",
      description: "Simple, transparent pricing that fits your church's budget.",
      href: "/pricing",
    },
    {
      title: "Contact Us",
      description: "Have questions? We'd love to hear from you.",
      href: "/contact",
    },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                About Us
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                Built by church leaders, for church leaders
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                We're on a mission to help churches focus on what matters most - building community and spreading their
                message.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="text-lg leading-relaxed mb-6">
                  Daily One Accord was born from a simple observation: church leaders were spending too much time on
                  administrative tasks and not enough time on ministry. We saw pastors juggling spreadsheets, struggling
                  with outdated software, and missing opportunities to connect with their congregations.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Founded in 2025 by Wes Shinn and Keiko Chibana-Shinn, we set out to build the platform we wished we
                  had. We combined decades of ministry experience with modern technology to create a solution that truly
                  understands the unique needs of churches.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we're building tools that help churches streamline operations, engage their members, and grow
                  their communities. We're just getting started on this journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">The Problem</h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                Most churches juggle five to ten disconnected tools for attendance, giving, scheduling, and
                communication. This fragmentation causes wasted time, data loss, poor visitor follow-up, and frustration
                among staff and volunteers. Existing platforms can be overpriced, outdated, or too complex—especially
                for small and mid-sized churches.
              </p>

              <Card className="p-8 border-l-4 border-l-destructive">
                <h3 className="text-2xl font-bold mb-6">Key Pain Points:</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Time Waste:</p>
                      <p className="text-muted-foreground">
                        10-20 hours per week on duplicate data entry and tool switching
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">High Costs:</p>
                      <p className="text-muted-foreground">$5,000-$20,000 annually on fragmented subscriptions</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Poor Integration:</p>
                      <p className="text-muted-foreground">
                        Disconnected systems lead to lost visitors and missed follow-ups
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Staff Frustration:</p>
                      <p className="text-muted-foreground">
                        Complex interfaces and outdated technology hinder ministry effectiveness
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">The Solution</h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                Daily One Accord consolidates all core functions—attendance tracking, team coordination, event
                scheduling, communications, and automation—into a unified, intuitive interface. With native integrations
                for Slack, Google Drive, and Telnyx SMS, the platform automates workflows and creates seamless
                collaboration between ministry leaders and teams.
              </p>

              <Card className="p-8 border-l-4 border-l-primary">
                <h3 className="text-2xl font-bold mb-6">Core Value Propositions:</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Unified Platform:</p>
                      <p className="text-muted-foreground">Replace 5-10 tools with one integrated system</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Massive Savings:</p>
                      <p className="text-muted-foreground">Save $4,000-$36,000+ annually vs Planning Center</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Modern Technology:</p>
                      <p className="text-muted-foreground">Built on Next.js 15 and Supabase for speed and security</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Slack-Native:</p>
                      <p className="text-muted-foreground">Real-time collaboration where teams already work</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Time Savings:</p>
                      <p className="text-muted-foreground">Recover 10-40 hours/month of staff productivity</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Faith-Driven:</p>
                      <p className="text-muted-foreground">Designed by ministry leaders for ministry leaders</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Expanded Biblical Foundation Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                Biblical Foundation & Theological Rationale
              </h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                Daily One Accord exists to serve the Church with tools that reflect biblical principles of unity, order,
                stewardship, shepherding care, and mission.
              </p>

              <div className="space-y-8">
                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">1) Unity that strengthens the Body</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Jesus prays, "that they may all be one" (John 17:21). A unified platform helps leaders, teams, and
                    members move together—reducing silos and strengthening fellowship (Acts 2:42–47; 1 Cor. 12).
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    One place for communication, service planning, and follow-up so ministries operate as one, not as
                    disconnected parts.
                  </p>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">2) Order that frees people to serve</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    "Let all things be done decently and in order" (1 Cor. 14:40). Good systems don't replace the
                    Spirit's work—they remove friction so people can serve with clarity.
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    Shared calendars, service rundowns, roles/permissions, and repeatable workflows that reduce
                    confusion and last-minute chaos (Acts 6:1–7 shows the early church organizing care so the Word could
                    spread).
                  </p>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">3) Stewardship that multiplies resources</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    "It is required of stewards that they be found faithful" (1 Cor. 4:2); the parable of the talents
                    commends wise multiplication (Matt. 25:14–30).
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    Affordable pricing, automation to save time, and analytics that guide wise decisions—helping
                    churches do more ministry with fewer tools and lower costs (Prov. 27:23 "know well the condition of
                    your flocks").
                  </p>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">4) Shepherding care that doesn't lose people</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Jesus pursues the one (Luke 15). Pastors are called to "shepherd the flock of God" (1 Pet. 5:2).
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    Visitor pipelines, follow-up reminders, attendance insights, and notes—so people are known,
                    contacted, and cared for, not lost between spreadsheets and apps.
                  </p>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">5) Mission and discipleship made practical</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The Great Commission calls us to make disciples (Matt. 28:19–20), which requires teaching,
                    gathering, and sending with intention.
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    Tools for classes, teams, communications, and events—so discipleship rhythms are scheduled,
                    measurable, and repeatable.
                  </p>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold mb-3">6) Mercy, justice, and integrity</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Pure religion includes caring for the vulnerable (Jas. 1:27) and walking in integrity (Prov. 11:3).
                  </p>
                  <p className="text-base font-semibold text-foreground mb-2">What this Means:</p>
                  <p className="text-base text-muted-foreground italic">
                    Privacy-first design, role-based access, and auditability. Sensitive data is safeguarded;
                    communication honors dignity.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How These Principles Shape Daily One Accord Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                How These Principles Shape Daily One Accord
              </h2>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">→</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Unified communication</p>
                      <p className="text-base text-muted-foreground">
                        minimizes confusion, encourages one-anothering (John 13:34–35).
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">→</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Clear roles & permissions</p>
                      <p className="text-base text-muted-foreground">equips the whole body to serve (Eph. 4:11–16).</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">→</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Automated follow-up</p>
                      <p className="text-base text-muted-foreground">pursues people with consistent care (Luke 15).</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">→</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Transparent metrics</p>
                      <p className="text-base text-muted-foreground">
                        supports faithful stewardship and planning (1 Cor. 4:2).
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">→</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Affordable pricing</p>
                      <p className="text-base text-muted-foreground">
                        frees resources for mission and mercy (Acts 4:32–35).
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Updated Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ministry Posture (Guardrails)</h2>
              <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">People Over Process</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tools support pastoral wisdom; they don't replace it. We believe technology should serve ministry and
                  help you focus on what matters most - your people.
                </p>
              </Card>

              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Privacy & Dignity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sensitive data is protected; communications honor people. We're committed to enterprise-grade security
                  and treating every member with respect.
                </p>
              </Card>

              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Simplicity First</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reduce noise so leaders can focus on presence and prayer (Acts 6:4). Church management shouldn't be
                  complicated—we build intuitive tools that anyone can master quickly.
                </p>
              </Card>

              <Card className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Kingdom Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Success is measured by faithfulness, fruit, and care—not vanity metrics. We're building for eternal
                  impact, not just growth numbers.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Meet the Founder</h2>
              <p className="text-xl text-muted-foreground text-center mb-12">
                A journey from military photojournalism to serving churches
              </p>

              <Card className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary/10">
                    <img
                      src="/images/wes-shinn.jpg"
                      alt="Wes Shinn, Co-Founder & CEO"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Wes Shinn</h3>
                    <p className="text-muted-foreground mb-6">Co-Founder & CEO</p>

                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p>
                        My journey as a visual storyteller began over two decades ago in military photojournalism,
                        documenting impactful stories and capturing intricate details during major national disasters.
                        This experience taught me to remain calm under pressure and find beauty in challenging
                        situations.
                      </p>

                      <p>
                        With 17 years of experience as a professional photographer and filmmaker, and formal education
                        in film school, I've mastered the art of transforming moments into lasting memories. My
                        cinematic eye and passion for storytelling have served hundreds of couples and families.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 my-8">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">Family First</h4>
                          </div>
                          <p className="text-sm">
                            Married to Keiko for 14 years (since 2011), with three children—Hana, Elias, and Emi—and our
                            dog River, who we consider our fourth child.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Heart className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">Daily Motivation</h4>
                          </div>
                          <p className="text-sm">
                            I spend every day with quiet time with God. I am a believer and give thanks every day to God
                            for being alive. I also work out and make my family a priority.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Globe className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">Places I've Traveled</h4>
                          </div>
                          <p className="text-sm">
                            Japan, China, Colombia, Peru, Kenya, Ukraine, Kyrgyzstan, England, Mexico, France
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Camera className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-foreground">What Makes Me Smile</h4>
                          </div>
                          <p className="text-sm">Watching couples get married and adventures with my family.</p>
                        </div>
                      </div>

                      <p>
                        Daily One Accord represents my commitment to serving churches with the same dedication I've
                        brought to capturing life's most important moments. Just as I build genuine connections with
                        couples to capture their authentic stories, I'm committed to understanding the unique needs of
                        each church we serve.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Join us on this journey</h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Be part of a growing community of churches transforming the way they operate and engage with their
                members.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg h-12 px-8">
                  <Link href="https://www.dailyoneaccord.com/waitlist">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <RelatedPages pages={relatedPages} title="Learn More" />
      </div>
    </>
  )
}
