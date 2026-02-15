import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  Bell,
  CreditCard,
  FileText,
  Globe,
  Lock,
  Smartphone,
  Video,
  Mail,
  FolderOpen,
  Share2,
  Download,
  Upload,
  ImageIcon,
  DollarSign,
  X,
  TrendingDown,
} from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { RelatedPages } from "@/components/seo/related-pages"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features - Complete Church Management Platform",
  description:
    "Explore all features of Daily One Accord: member management, event scheduling, SMS & email communication, Slack integration, digital asset management, social media scheduling, analytics, and more. Save 60% vs traditional church software.",
  keywords: [
    "church management features",
    "church software features",
    "member management system",
    "church event planning",
    "church communication tools",
    "church analytics",
    "digital asset management church",
    "social media scheduling church",
  ],
  openGraph: {
    title: "Features - Complete Church Management Platform | Daily One Accord",
    description:
      "Explore all features: member management, event scheduling, communication tools, analytics, and more. Save 60% vs traditional systems.",
    type: "website",
    url: "/features",
  },
  alternates: {
    canonical: "/features",
  },
}

export default function FeaturesPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "Features", url: "https://dailyoneaccord.com/features" },
  ]

  const relatedPages = [
    {
      title: "View Pricing",
      description: "See our simple, transparent pricing plans starting at $27/month.",
      href: "/pricing",
    },
    {
      title: "About Us",
      description: "Learn about our mission to help churches focus on ministry, not administration.",
      href: "/about",
    },
    {
      title: "Get Started",
      description: "Start your 7-day free trial today. No credit card required.",
      href: "/signup",
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
                Features
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Everything you need in one platform</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Powerful tools designed to help your church thrive. From member management to event planning, we've got
                you covered.
              </p>
            </div>
          </div>
        </section>

        {/* Cost Savings Comparison Table */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Cost Comparison
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                  Save thousands with Daily One Accord
                </h2>
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
                          <div className="font-bold text-2xl">$99</div>
                          <div className="text-xs text-muted-foreground mt-1">per month</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-bold text-2xl">$149</div>
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

              {/* Cost Breakdown */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="p-6 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">60%</div>
                  <div className="font-semibold mb-2">Lower Cost</div>
                  <p className="text-sm text-muted-foreground">
                    Save up to 60% compared to Planning Center and other traditional systems
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">$2,400+</div>
                  <div className="font-semibold mb-2">Annual Savings</div>
                  <p className="text-sm text-muted-foreground">
                    Average church saves over $2,400 per year by switching to Daily One Accord
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">5+ Tools</div>
                  <div className="font-semibold mb-2">Replaced</div>
                  <p className="text-sm text-muted-foreground">
                    Eliminate separate subscriptions for messaging, storage, analytics, and more
                  </p>
                </Card>
              </div>

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
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Member Management */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Member Management</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Keep your congregation connected with comprehensive member profiles, attendance tracking, and
                  engagement insights.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Detailed member profiles with contact information and history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Automated attendance tracking for services and events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Family grouping and relationship management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Custom fields and tags for organization</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-24 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-32" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-28 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-36" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-32 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-28" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Event Planning */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-3 bg-foreground/10 rounded w-32" />
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                      <div className="h-2 bg-foreground/5 rounded w-full" />
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-3 bg-foreground/10 rounded w-28" />
                        <Badge variant="secondary">Today</Badge>
                      </div>
                      <div className="h-2 bg-foreground/5 rounded w-full" />
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-3 bg-foreground/10 rounded w-36" />
                        <Badge variant="outline">Next Week</Badge>
                      </div>
                      <div className="h-2 bg-foreground/5 rounded w-full" />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Event Planning & Scheduling</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Organize services, classes, and special events with our intuitive calendar system and automated
                  reminders.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Visual calendar with drag-and-drop scheduling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Automated event reminders via SMS and email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>RSVP tracking and capacity management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Recurring event templates for regular services</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Communication Hub */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Multi-Channel Communication</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Reach your congregation where they are with SMS, email, and Slack integration. Keep everyone informed
                  and engaged.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Bulk SMS messaging with personalization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Beautiful email templates and campaigns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Slack integration for team collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Segmented messaging by groups or tags</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">SMS</div>
                  </Card>
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <Mail className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">Email</div>
                  </Card>
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">Slack</div>
                  </Card>
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <Bell className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">Push</div>
                  </Card>
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <Globe className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">Web</div>
                  </Card>
                  <Card className="p-4 flex flex-col items-center justify-center text-center">
                    <Smartphone className="h-8 w-8 text-primary mb-2" />
                    <div className="text-xs font-medium">Mobile</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className="text-2xl font-bold">+12%</span>
                    </div>
                    <div className="h-32 bg-white rounded-lg flex items-end gap-2 p-4">
                      <div className="flex-1 bg-primary/20 rounded" style={{ height: "40%" }} />
                      <div className="flex-1 bg-primary/30 rounded" style={{ height: "55%" }} />
                      <div className="flex-1 bg-primary/40 rounded" style={{ height: "70%" }} />
                      <div className="flex-1 bg-primary/50 rounded" style={{ height: "60%" }} />
                      <div className="flex-1 bg-primary rounded" style={{ height: "85%" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <div className="text-2xl font-bold">1,234</div>
                        <div className="text-xs text-muted-foreground">Total Members</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">89%</div>
                        <div className="text-xs text-muted-foreground">Engagement Rate</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Analytics & Insights</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Make data-driven decisions with comprehensive analytics dashboards and custom reports.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Real-time attendance and engagement metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Growth trends and historical comparisons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Custom reports and data exports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Giving and financial tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Digital Asset Management */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Digital Asset Management</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Centralize all your church media files in one place. View, download, and share sermons, graphics,
                  videos, and documents directly within your church management system.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Google Drive integration for seamless file access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>View and download media files without leaving the platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Organize sermons, bulletins, graphics, and videos in folders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Share files with team members and congregation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Upload and manage files directly from the dashboard</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                      <ImageIcon className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-32 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-20" />
                      </div>
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                      <Video className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-28 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-24" />
                      </div>
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-36 mb-2" />
                        <div className="h-2 bg-foreground/5 rounded w-28" />
                      </div>
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Upload className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Upload New Files</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Scheduling */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Share2 className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Scheduled Post</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded w-full mb-2" />
                      <div className="h-3 bg-foreground/10 rounded w-3/4 mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="h-2 bg-foreground/5 rounded w-24" />
                        <Badge variant="secondary">Tomorrow 9:00 AM</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Share2 className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Scheduled Post</span>
                      </div>
                      <div className="h-3 bg-foreground/10 rounded w-full mb-2" />
                      <div className="h-3 bg-foreground/10 rounded w-2/3 mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="h-2 bg-foreground/5 rounded w-24" />
                        <Badge variant="secondary">Friday 3:00 PM</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="h-8 bg-white rounded flex items-center justify-center">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-8 bg-white rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="h-8 bg-white rounded flex items-center justify-center">
                        <Video className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Social Media Scheduling</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Schedule and post to social media directly from your church management system. Keep your online
                  presence active without switching between multiple platforms.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Schedule posts in advance for optimal engagement times</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Post to multiple social media platforms simultaneously</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Share sermons, events, and announcements with one click</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Attach images, videos, and links to your posts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Manage your church's social media presence from one dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">And so much more</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Additional features to help you manage every aspect of your church.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <CreditCard className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  Online Giving
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Accept donations and tithes with integrated payment processing
                </p>
              </Card>

              <Card className="p-6">
                <Video className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Streaming</h3>
                <p className="text-sm text-muted-foreground">Stream services with Zoom and YouTube integration</p>
              </Card>

              <Card className="p-6">
                <Smartphone className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  Mobile App
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">Native iOS and Android apps for on-the-go access</p>
              </Card>

              <Card className="p-6">
                <Lock className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">Control permissions with granular access controls</p>
              </Card>

              <Card className="p-6">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Data Security</h3>
                <p className="text-sm text-muted-foreground">Enterprise-grade security with automatic backups</p>
              </Card>

              <Card className="p-6">
                <Bell className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
                <p className="text-sm text-muted-foreground">Automated reminders and alerts for important events</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to get started?</h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Join hundreds of churches using Daily One Accord to streamline operations and grow their community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg h-12 px-8">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <RelatedPages pages={relatedPages} title="Explore More" />
      </div>
    </>
  )
}
