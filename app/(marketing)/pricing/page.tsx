import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, Zap, DollarSign, Lock } from "lucide-react"
import { PricingSchema } from "@/components/seo/pricing-schema"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { RelatedPages } from "@/components/seo/related-pages"

export const metadata: Metadata = {
  title: "Pricing - Simple & Transparent Plans + FREE Slack for Churches",
  description:
    "Choose the perfect church management plan for your ministry. Starting at $24/month. Get FREE Slack (saves $840-$26,250/year) with nonprofit discount. Compare features across Starter, Growth, and Enterprise plans.",
  keywords: [
    "church software pricing",
    "church management cost",
    "affordable church software",
    "church software plans",
    "free slack for churches",
    "church nonprofit discount",
  ],
  openGraph: {
    title: "Pricing - Simple & Transparent Plans + FREE Slack | Daily One Accord",
    description:
      "Starting at $24/month. Get FREE Slack for churches (saves $840-$26,250/year). Unified communication that eliminates fragmentation.",
    type: "website",
    url: "/pricing",
  },
  alternates: {
    canonical: "/pricing",
  },
}

export default function PricingPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "Pricing", url: "https://dailyoneaccord.com/pricing" },
  ]

  const relatedPages = [
    {
      title: "All Features",
      description: "Explore the complete list of features included in each plan.",
      href: "/features",
    },
    {
      title: "Frequently Asked Questions",
      description: "Common questions about pricing, billing, and plan changes.",
      href: "/faq",
    },
    {
      title: "Contact Sales",
      description: "Need a custom plan? Our team is here to help find the right solution.",
      href: "/contact",
    },
  ]

  return (
    <>
      <PricingSchema />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                <Lock className="h-3 w-3 mr-1" />
                Lock In Your Price Forever
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Simple, transparent pricing</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Choose the plan that's right for your church. Flat-rate pricing with no per-seat charges within your
                range.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Your Price is Locked In Forever</h3>
                    <p className="text-sm text-muted-foreground">
                      Subscribe at launch pricing and keep this rate for life. Even when prices increase in the future,
                      your monthly cost stays the same—guaranteed.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Slack Nonprofit Discount Banner */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-900">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Save $840-$26,250/year with FREE Slack</h3>
                    <p className="text-sm text-muted-foreground">
                      Churches with 501(c)(3) status qualify for FREE Slack Pro (up to 250 users).
                      <Link href="#slack-discount" className="text-primary font-medium ml-1">
                        Learn how to apply →
                      </Link>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <Card className="p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-muted-foreground">Perfect for small churches with 3-10 Slack users</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$24</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">3-10 Slack seats (flat rate)</p>
                  <p className="text-sm font-medium text-green-600 mt-2">+ FREE Slack (with nonprofit discount)</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3-10 Slack seats (flat rate)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Visitor management kanban</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Attendance tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Event management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Slack integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Optional add-on:</p>
                  <Badge variant="outline" className="text-xs">
                    Social Media: $14/month
                  </Badge>
                </div>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
              </Card>

              {/* Growth Plan */}
              <Card className="p-8 flex flex-col border-primary shadow-lg relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Zap className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Growth</h3>
                  <p className="text-muted-foreground">For growing churches with 3-20 Slack users</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$79</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">3-20 Slack seats (flat rate)</p>
                  <p className="text-sm font-medium text-green-600 mt-2">+ FREE Slack (with nonprofit discount)</p>
                  <Badge variant="secondary" className="mt-2">
                    Social Media Included
                  </Badge>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3-20 Slack seats (flat rate)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Starter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Social media posting INCLUDED</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced Slack workflows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Multi-channel notifications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>

              {/* Enterprise Plan */}
              <Card className="p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-muted-foreground">For large churches with unlimited Slack users</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$199</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Unlimited Slack seats</p>
                  <p className="text-sm font-medium text-green-600 mt-2">+ FREE Slack (up to 250 users)</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited Slack seats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Growth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced security</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom training</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Email support</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
              </Card>
            </div>

            {/* Social Media Add-on */}
            <div className="max-w-2xl mx-auto mt-12">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-3">
                      Add-on for Starter Plan
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Social Media Posting</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule and publish posts to Facebook, Instagram, and other platforms directly from your
                      dashboard. Available as an add-on at checkout for Starter plan customers.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Schedule posts to Facebook & Instagram</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Calendar view of scheduled content</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Media library integration</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold mb-2">$14</div>
                    <div className="text-sm text-muted-foreground mb-4">/month</div>
                    <p className="text-xs text-muted-foreground mb-2">Included in Growth & Enterprise</p>
                    <p className="text-xs font-medium text-primary">Add at checkout for Starter</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto mt-16" id="slack-discount">
              <Card className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">What Are Seats?</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Understanding Slack Seats</h3>
                    <p className="text-muted-foreground mb-4">
                      A "seat" refers to a user in your Slack workspace. Our pricing is based on how many people in your
                      church team need access to Slack for collaboration and attendance tracking.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Starter (3-10 seats):</strong> Perfect for small churches with 3-10 staff or volunteer
                          leaders
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Growth (3-20 seats):</strong> Ideal for growing churches with 3-20 team members
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Enterprise (Unlimited):</strong> For large churches with unlimited team members
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Get FREE Slack with Nonprofit Discount
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Churches with 501(c)(3) status can apply for Slack's nonprofit discount program and get{" "}
                      <strong className="text-foreground">Slack Pro for FREE</strong> (up to 250 users). This saves you
                      $840-$26,250 per year!
                    </p>

                    <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg mb-4">
                      <h4 className="font-semibold mb-3">How to Apply for FREE Slack:</h4>
                      <ol className="space-y-2 list-decimal list-inside text-sm">
                        <li>
                          Visit{" "}
                          <a
                            href="https://slack.com/help/articles/204368833-Apply-for-the-Slack-for-Nonprofits-discount"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium underline"
                          >
                            Slack's Nonprofit Program page
                          </a>
                        </li>
                        <li>Submit your 501(c)(3) documentation</li>
                        <li>Get approved (usually within 1-2 weeks)</li>
                        <li>Enjoy FREE Slack Pro for up to 250 users</li>
                      </ol>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="p-4 text-center bg-muted/50">
                        <div className="text-2xl font-bold text-green-600 mb-1">$0</div>
                        <div className="text-xs text-muted-foreground">Slack cost with nonprofit discount</div>
                      </Card>
                      <Card className="p-4 text-center bg-muted/50">
                        <div className="text-2xl font-bold text-green-600 mb-1">$840-$26,250</div>
                        <div className="text-xs text-muted-foreground">Annual savings on Slack</div>
                      </Card>
                      <Card className="p-4 text-center bg-muted/50">
                        <div className="text-2xl font-bold text-green-600 mb-1">250</div>
                        <div className="text-xs text-muted-foreground">Max users on free plan</div>
                      </Card>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-xl font-semibold mb-3">Flat-Rate Pricing = No Surprises</h3>
                    <p className="text-muted-foreground">
                      Unlike other platforms that charge per seat, we offer flat-rate pricing within your seat range.
                      Whether you have 3 users or 10 users on the Starter plan, you pay the same $24/month. This makes
                      budgeting simple and predictable.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Related Pages Section */}
            <div className="max-w-3xl mx-auto mt-12">
              <RelatedPages pages={relatedPages} title="Need More Information?" />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently asked questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next
                    billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">What happens after the free trial?</h3>
                  <p className="text-muted-foreground">
                    After your 7-day free trial, you'll be automatically charged for your selected plan. You can cancel
                    anytime during the trial with no charges.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Will my price increase in the future?</h3>
                  <p className="text-muted-foreground">
                    No! When you subscribe at launch pricing, your rate is locked in forever. Even if we raise prices
                    for new customers in the future, your monthly cost will never change as long as you remain
                    subscribed.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-muted-foreground">
                    We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers for
                    annual plans.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
                  <p className="text-muted-foreground">
                    Absolutely. We use enterprise-grade encryption and security measures to protect your data. All plans
                    include automatic daily backups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to get started?</h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Join our waitlist to be notified when we launch. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg h-12 px-8">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
