import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  CheckCircle2,
  Calendar,
  Kanban,
  MessageSquare,
  Share2,
  FolderOpen,
  DollarSign,
  BarChart3,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  Zap,
} from "lucide-react"

export const metadata = {
  title: "How It Works | Daily One Accord",
  description:
    "See how Daily One Accord unifies every aspect of church operations into one cohesive system—from visitor follow-up to service planning, team coordination to social media.",
}

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Complete Platform Walkthrough
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              One Platform. Infinite Possibilities. Zero Fragmentation.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              See how Daily One Accord unifies every aspect of church operations into one cohesive system—from visitor
              follow-up to service planning, team coordination to social media.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="https://www.dailyoneaccord.com/waitlist">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#workflow">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Daily One Accord Workflow */}
      <section id="workflow" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">The Daily One Accord Workflow</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Daily One Accord replaces 5-10 disconnected tools with one unified platform. Here's how it works:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>1. Capture Every Interaction</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Visitors check in via mobile or kiosk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Attendance tracked in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Data flows instantly to your team via Slack</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Kanban className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>2. Coordinate Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Kanban boards assign tasks with clear ownership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Automated Slack notifications keep everyone on track</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Service plans and schedules sync across all channels</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>3. Engage & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Automated follow-up emails and SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Social media posts scheduled weeks in advance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Analytics show what's working</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl text-balance">
                See how Daily One Accord unifies church operations
              </h2>
            </div>

            <div className="relative">
              {/* Horizontal scroll container */}
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
                {/* Visitor Management */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Visitor Management</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Never let a visitor fall through the cracks. Capture information, trigger automated welcome
                        emails, and track the journey from first visit to regular attendance.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See visitor management
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Tracking */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Smart Attendance</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Track attendance via Slack bot commands, get instant notifications when key volunteers are
                        absent, and analyze historical trends for better planning.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See attendance tracking
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Service Planning */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Service Planning</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Create service plans with songs, timing, and speaker notes. Automatically distribute to all team
                        members via Slack, email, and SMS.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See service planning
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Kanban Boards */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <Kanban className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Task Management</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Assign tasks with clear ownership and deadlines. Automated Slack notifications ensure nothing
                        falls through the cracks with visual kanban boards.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See task management
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Communication */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Multi-Channel Communication</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Send messages via Slack, email, and SMS from one place. Segment audiences, schedule in advance,
                        and track engagement across all channels.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See communication tools
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <Share2 className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Social Media Scheduling</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Schedule posts to Facebook, Instagram, and Twitter weeks in advance. Content calendar view,
                        automatic posting, and engagement analytics included.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See social media tools
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Giving */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Giving Platform</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Recurring donations, one-time gifts, donor management, automated receipts, and financial
                        reporting with secure payment processing.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See giving platform
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics */}
                <div className="flex-none w-[340px] snap-start">
                  <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Analytics & Reporting</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Real-time visibility into attendance trends, giving patterns, and volunteer engagement. Custom
                        reports and predictive analytics for growth planning.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        See analytics dashboard
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Scroll hint */}
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">← Scroll to see more features →</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Works With the Tools You Already Use</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Daily One Accord doesn't force you to abandon your existing tools. We integrate with the platforms you
              already know and love.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Slack</p>
                <p className="text-xs text-muted-foreground">Native integration</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Google Drive</p>
                <p className="text-xs text-muted-foreground">File management</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Google Calendar</p>
                <p className="text-xs text-muted-foreground">Two-way sync</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold">Stripe</p>
                <p className="text-xs text-muted-foreground">Payment processing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Continuous Innovation */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Always Improving. Always Innovating.</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Daily One Accord is a living platform. We're constantly adding new features, integrations, and
              improvements based on feedback from churches like yours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Slack Bot Attendance Tracking</p>
                      <p className="text-sm text-muted-foreground">Q4 2024</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Social Media Scheduling</p>
                      <p className="text-sm text-muted-foreground">Q1 2025</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Google Drive Integration</p>
                      <p className="text-sm text-muted-foreground">Q2 2025</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced Analytics Dashboard</p>
                      <p className="text-sm text-muted-foreground">Q3 2025</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Mobile app for iOS and Android</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Advanced giving analytics</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Volunteer scheduling automation</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>AI-powered sermon transcription</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Planning Center data import</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p>Custom branded member portal</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Your <span className="font-semibold text-foreground">$99 annual maintenance fee</span> ensures we can
                  continue investing in new features, integrations, and infrastructure improvements. As Daily One Accord
                  grows, so do your capabilities—without ever raising your monthly subscription price.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">From Setup to Success in 3 Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <CardTitle>Sign Up & Setup</CardTitle>
                <CardDescription>Day 1</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Choose your plan (Starter, Growth, or Enterprise)</li>
                  <li>• Pay one-time $199 setup fee</li>
                  <li>• Receive onboarding email with setup guide</li>
                  <li>• Connect Slack, Google Drive, Stripe</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <CardTitle>Import Your Data</CardTitle>
                <CardDescription>Days 2-7</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Import member list via CSV</li>
                  <li>• Set up user roles and permissions</li>
                  <li>• Create initial service plans and events</li>
                  <li>• Train staff on key features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <CardTitle>Go Live</CardTitle>
                <CardDescription>Week 2+</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Launch to congregation</li>
                  <li>• Start tracking attendance and visitors</li>
                  <li>• Begin automated follow-up workflows</li>
                  <li>• Monitor analytics and optimize</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Our team is here to help every step of the way.</span>{" "}
                  Email support, video tutorials, and live onboarding calls ensure your success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Reminder */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Lock in your price forever. Early subscribers never see a price increase on their monthly subscription.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for small churches</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$24</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">+ $99/year maintenance (Year 2+)</p>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-600">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Growth</CardTitle>
                <CardDescription>For growing churches</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">+ $99/year maintenance (Year 2+)</p>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large churches</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">+ $99/year maintenance (Year 2+)</p>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/pricing">View Details</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">Ready to Unify Your Church Operations?</h2>
            <p className="text-xl mb-8 text-blue-100 text-pretty">
              Join hundreds of churches that have eliminated fragmentation and embraced unified communication. Start
              your free trial today—no credit card required.
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
    </div>
  )
}
