import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FAQSchema } from "@/components/seo/faq-schema"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about Daily One Accord church management software. Learn about pricing, features, security, support, and more.",
  keywords: ["church management FAQ", "church software questions", "pricing questions", "support", "security"],
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Daily One Accord",
    description: "Find answers to common questions about Daily One Accord church management software.",
    type: "website",
    url: "/faq",
  },
  alternates: {
    canonical: "/faq",
  },
}

export default function FAQPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "FAQ", url: "https://dailyoneaccord.com/faq" },
  ]

  return (
    <>
      <FAQSchema />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                FAQ
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Frequently Asked Questions</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Everything you need to know about Daily One Accord. Can't find what you're looking for? Contact our
                support team.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Getting Started */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">How do I get started with Daily One Accord?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Getting started is easy! Simply sign up for a free 7-day trial, no credit card required. Once
                      you've created your account, you'll be guided through a quick setup process to configure your
                      church profile, add team members, and import your member data. Our onboarding wizard makes it
                      simple to get up and running in minutes.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Can I import my existing member data?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We support importing data from CSV files and can help you migrate from other church
                      management systems. Our support team is available to assist with data migration to ensure a smooth
                      transition.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Do I need technical expertise to use the platform?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Not at all! Daily One Accord is designed to be intuitive and user-friendly. If you can use email
                      or social media, you can use our platform. We also provide video tutorials, documentation, and
                      live support to help you every step of the way.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Pricing & Billing */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Pricing & Billing</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">What's included in the free trial?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your 7-day free trial includes full access to all features in the Growth plan. You can add
                      unlimited team members, import your data, and explore all the tools. No credit card is required to
                      start your trial, and you can cancel anytime.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Can I change plans later?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You can upgrade or downgrade your plan at any time from your account settings. Changes take effect
                      immediately, and we'll prorate any charges or credits based on your billing cycle.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Do you offer discounts for annual billing?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! Save 20% when you choose annual billing instead of monthly. We also offer special pricing for
                      multi-site churches and denominations. Contact our sales team to learn more about volume
                      discounts.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH bank
                      transfers for annual plans. All payments are processed securely through Stripe.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Features & Functionality */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Features & Functionality</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Can I send SMS messages to my congregation?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! SMS messaging is included in the Growth and Enterprise plans. You can send personalized bulk
                      messages, automated reminders, and targeted communications to specific groups. SMS credits are
                      included in your plan, with additional credits available if needed.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Does Daily One Accord integrate with other tools?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We integrate with popular tools like Slack, Zoom, Google Calendar, Mailchimp, and more. Our
                      API also allows for custom integrations. Enterprise customers can work with our team to build
                      custom integrations specific to their needs.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Is there a mobile app?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We offer native mobile apps for both iOS and Android. Your team can manage members, check-in
                      attendees, send messages, and access all key features from their phones or tablets. The mobile app
                      is included with all plans.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Can I track online giving and donations?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! Our online giving feature (available in Growth and Enterprise plans) allows you to accept
                      donations, track giving history, generate tax statements, and set up recurring donations. We
                      integrate with Stripe for secure payment processing.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Security & Privacy */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Security & Privacy</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Is my church data secure?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Absolutely. We use enterprise-grade security measures including 256-bit SSL encryption, secure
                      data centers, and regular security audits. All data is backed up daily, and we maintain SOC 2 Type
                      II compliance. Your data is yours - we never share or sell it to third parties.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Who can access our church data?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You have complete control over who can access your data. Our role-based permission system lets you
                      define exactly what each team member can see and do. You can set different permission levels for
                      staff, volunteers, and administrators.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">What happens to my data if I cancel?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You can export all your data at any time in standard formats (CSV, PDF). If you cancel your
                      subscription, you'll have 30 days to download your data before it's permanently deleted. We make
                      it easy to take your data with you - no lock-in.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Support */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Support</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">What kind of support do you offer?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All plans include email support with response times within 24 hours. Growth plan customers get
                      priority support with faster response times. Enterprise customers receive dedicated account
                      management, phone support, and custom training sessions.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Do you provide training?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We offer comprehensive video tutorials, documentation, and webinars for all users. Enterprise
                      customers receive personalized onboarding and training sessions for their team. We also have an
                      active community forum where you can connect with other church leaders.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">How quickly do you add new features?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We ship new features and improvements every week based on customer feedback. You can view our
                      public roadmap to see what we're working on and vote on features you'd like to see. We're
                      committed to continuous improvement and regularly engage with our community to prioritize
                      development.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Common Objections */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Common Objections</h2>
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      "We're already using Planning Center and it works fine."
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      That's great! Planning Center is a solid tool. A lot of our churches came from Planning Center.
                      The question we ask is: Are you using all 7 modules? Most churches use 2–3, but still pay for the
                      full suite. With Daily One Accord, you get everything in one platform for about half the cost —
                      plus Slack integration, which Planning Center doesn't offer. Want to see a side-by-side
                      comparison?
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-3">"Our staff is too busy to learn a new system."</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      That's exactly the problem we solve. Our average church saves 10–15 hours per week because
                      everything is in one place. No more switching between apps, re-entering data, or tracking down
                      information in five different systems. We also handle data migration and provide hands-on
                      training. Most churches are fully onboarded in under 2 weeks.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Still have questions?</h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg h-12 px-8">
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                  <Link href="https://www.dailyoneaccord.com/waitlist">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
