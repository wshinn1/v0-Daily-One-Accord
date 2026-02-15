"use client"

import {
  Download,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Mail,
  Calendar,
  Gift,
  MessageSquare,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MarketingStrategyContent() {
  const handleDownloadPDF = () => {
    window.print()
  }

  const funnelStages = [
    {
      stage: "Awareness",
      description: "Facebook & Instagram ads targeting church leaders",
      tactics: ["Launch promotion: Growth plan $49/month (normally $79)", "Targeted ads to church decision-makers"],
      metrics: ["Ad impressions", "Click-through rate", "Cost per click"],
    },
    {
      stage: "Interest",
      description: "Facebook community engagement",
      tactics: [
        "Daily One Accord Facebook community",
        "Tips, tools, and best practices",
        "Church leader interviews",
        "Success stories and case studies",
      ],
      metrics: ["Community members", "Engagement rate", "Content reach"],
    },
    {
      stage: "Consideration",
      description: "Educational content and demos",
      tactics: ["Free trial or demo access", "Monthly highlight emails", "Feature walkthroughs", "ROI calculators"],
      metrics: ["Trial signups", "Email open rates", "Demo requests"],
    },
    {
      stage: "Conversion",
      description: "Close the sale",
      tactics: ["Launch pricing incentive", "Personal onboarding", "Quick setup support"],
      metrics: ["Conversion rate", "Time to first value", "Setup completion"],
    },
    {
      stage: "Retention & Growth",
      description: "Keep customers and expand",
      tactics: [
        "Referral program: $10/month discount per church referred",
        "Monthly highlight emails",
        "Community engagement",
        "Upsell to higher tiers",
      ],
      metrics: ["Churn rate", "Referrals generated", "Upgrade rate"],
    },
  ]

  const acquisitionChannels = [
    {
      channel: "Facebook/Instagram Ads",
      budget: "$2,000-$3,000/month",
      cac: "$150-$250",
      description: "Targeted ads to church leaders and decision-makers",
      tactics: [
        "Launch promotion: Growth plan $49/month (save $30/month)",
        "Retargeting campaigns",
        "Lookalike audiences",
        "Video testimonials",
      ],
    },
    {
      channel: "Facebook Community",
      budget: "$500/month (content creation)",
      cac: "$50-$100 (organic)",
      description: "Build engaged community of church leaders",
      tactics: [
        "Daily tips and tools",
        "Weekly church leader interviews",
        "Live Q&A sessions",
        "Member success spotlights",
        "Exclusive community-only offers",
      ],
    },
    {
      channel: "Email Marketing",
      budget: "$200/month (tools + design)",
      cac: "$25-$50",
      description: "Monthly highlight emails to prospects and customers",
      tactics: [
        "Monthly newsletter with platform updates",
        "Success stories and case studies",
        "Tips for church operations",
        "Feature highlights and tutorials",
      ],
    },
    {
      channel: "Church Events & Conferences",
      budget: "$5,000-$10,000/year",
      cac: "$200-$400",
      description: "Network with church leaders at industry events",
      tactics: [
        "Booth at church conferences",
        "Speaking opportunities",
        "Sponsor church leadership events",
        "Host local church leader meetups",
      ],
    },
    {
      channel: "Referral Program",
      budget: "$10/month per referral",
      cac: "$50-$100",
      description: "Incentivize existing customers to refer other churches",
      tactics: [
        "$10/month discount for each church referred",
        "Discount continues as long as referred church stays",
        "Can refer multiple churches (discounts stack)",
        "Easy sharing tools in dashboard",
      ],
    },
  ]

  const communityStrategy = {
    platform: "Facebook Group",
    name: "Daily One Accord Community",
    target: "1,000+ members in Year 1",
    content: [
      {
        type: "Daily Tips",
        frequency: "5x per week",
        examples: ["Church operations best practices", "Slack workflow tips", "Communication templates"],
      },
      {
        type: "Church Leader Interviews",
        frequency: "Weekly",
        examples: ["How [Church Name] uses Daily One Accord", "Success stories and ROI", "Tips from experienced users"],
      },
      {
        type: "Live Q&A",
        frequency: "Monthly",
        examples: ["Platform walkthroughs", "Feature deep-dives", "Ask the founder anything"],
      },
      {
        type: "Member Spotlights",
        frequency: "Bi-weekly",
        examples: ["Highlight innovative uses", "Share success metrics", "Build community connections"],
      },
    ],
    engagement: [
      "Respond to all comments within 24 hours",
      "Create polls and discussions",
      "Encourage member-to-member support",
      "Recognize active contributors",
      "Exclusive community-only discounts",
    ],
  }

  const referralProgram = {
    structure: "$10/month discount per church referred",
    rules: [
      "Referring church gets $10/month off their subscription",
      "Discount applies as long as referred church remains active",
      "Discounts do NOT stack monthly (max $10/month discount)",
      "Can refer multiple churches over time",
      "If Church A refers Church B in January, Church A gets $10/month off",
      "If Church A refers Church C in March, Church A still gets $10/month off (not $20)",
      "If Church B cancels, Church A loses the discount unless they refer another church",
    ],
    implementation: [
      "Unique referral links in dashboard",
      "Automated tracking and discount application",
      "Monthly referral reports",
      "Referral leaderboard in community",
      "Special recognition for top referrers",
    ],
    projections: [
      "Year 1: 10% of customers refer (20 referrals from 200 customers)",
      "Year 2: 15% of customers refer (75 referrals from 500 customers)",
      "Year 3: 20% of customers refer (200 referrals from 1,000 customers)",
    ],
  }

  const emailStrategy = {
    frequency: "Monthly",
    name: "Daily One Accord Highlights",
    segments: [
      { name: "Prospects", content: "Platform benefits, success stories, trial offers" },
      { name: "Trial Users", content: "Onboarding tips, feature highlights, conversion incentives" },
      { name: "Active Customers", content: "New features, tips & tricks, community highlights" },
      { name: "Churned Customers", content: "Win-back offers, what's new, re-engagement campaigns" },
    ],
    content: [
      "Platform updates and new features",
      "Customer success stories",
      "Church operations tips",
      "Community highlights",
      "Upcoming events and webinars",
      "Exclusive offers and promotions",
    ],
  }

  const eventStrategy = {
    types: [
      {
        type: "National Church Conferences",
        examples: ["Exponential Conference", "Orange Conference", "Catalyst Conference"],
        investment: "$3,000-$5,000 per event",
        frequency: "2-3 per year",
      },
      {
        type: "Regional Church Events",
        examples: ["State denominational conferences", "Local church leadership summits"],
        investment: "$1,000-$2,000 per event",
        frequency: "4-6 per year",
      },
      {
        type: "Hosted Meetups",
        examples: ["Local church leader lunches", "Platform demo sessions"],
        investment: "$200-$500 per event",
        frequency: "Monthly in target cities",
      },
    ],
    tactics: [
      "Booth presence with live demos",
      "Speaking opportunities on church operations",
      "Sponsor church leader networking events",
      "Collect leads with special conference pricing",
      "Follow-up within 48 hours of event",
    ],
  }

  const cacCalculation = {
    blendedCAC: "$150-$200",
    breakdown: [
      { channel: "Facebook Ads", cac: "$150-$250", volume: "40%" },
      { channel: "Facebook Community", cac: "$50-$100", volume: "25%" },
      { channel: "Email Marketing", cac: "$25-$50", volume: "15%" },
      { channel: "Referrals", cac: "$50-$100", volume: "15%" },
      { channel: "Events", cac: "$200-$400", volume: "5%" },
    ],
    ltv: "$4,800",
    ltvCacRatio: "24:1 to 32:1",
    paybackPeriod: "1-2 months",
    notes: [
      "LTV based on $200/month ARPU × 24 months average customer lifetime",
      "Excellent LTV:CAC ratio (3:1 is considered good, we're at 24:1+)",
      "Fast payback period enables aggressive growth",
    ],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Marketing Strategy & Customer Acquisition</h1>
          <p className="text-muted-foreground mt-2">Comprehensive go-to-market strategy for Daily One Accord</p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Daily One Accord</h1>
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
          Marketing Strategy & Customer Acquisition
        </h2>
        <p className="text-sm text-center text-red-600 font-semibold">Confidential</p>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            Our customer acquisition strategy centers on building an engaged community of church leaders through a
            Facebook group, supported by targeted advertising with launch pricing incentives. We'll leverage a referral
            program, monthly email highlights, and strategic event presence to create a sustainable, low-CAC growth
            engine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Target CAC</p>
              <p className="text-2xl font-bold text-blue-600">$150-$200</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Customer LTV</p>
              <p className="text-2xl font-bold text-green-600">$4,800</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
              <p className="text-2xl font-bold text-purple-600">24:1+</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Payback Period</p>
              <p className="text-2xl font-bold text-orange-600">1-2 mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Marketing Funnel
          </CardTitle>
          <CardDescription>Customer journey from awareness to advocacy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {funnelStages.map((stage, index) => (
              <div key={stage.stage} className="relative">
                {index < funnelStages.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-blue-200" />
                )}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 relative z-10">
                    {index + 1}
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-bold text-lg mb-1">{stage.stage}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Tactics:</h4>
                      <ul className="text-sm space-y-1">
                        {stage.tactics.map((tactic, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                      <h4 className="font-semibold text-sm mt-3">Key Metrics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.metrics.map((metric, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Launch Promotion */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Megaphone className="w-5 h-5" />
            Launch Promotion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Growth Plan: $49/month</h3>
            <p className="text-lg text-muted-foreground mb-4">
              <span className="line-through">$79/month</span> → Save $30/month during launch period
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Duration:</strong> First 6 months of launch (or first 500 customers)
              </p>
              <p>
                <strong>Lock-in:</strong> Customers who sign up during launch keep $49/month pricing for 12 months
              </p>
              <p>
                <strong>Value Proposition:</strong> $360/year savings + all Growth plan features
              </p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-semibold mb-2">Why This Works:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-orange-600">✓</span>
                <span>Creates urgency and FOMO (limited time offer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">✓</span>
                <span>Lowers barrier to entry for early adopters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">✓</span>
                <span>Builds initial customer base quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">✓</span>
                <span>Generates testimonials and case studies</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Acquisition Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Customer Acquisition Channels
          </CardTitle>
          <CardDescription>Multi-channel approach to reach church leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {acquisitionChannels.map((channel) => (
              <div key={channel.channel} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{channel.channel}</h3>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold">{channel.budget}</p>
                    <p className="text-xs text-muted-foreground mt-1">CAC: {channel.cac}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-sm mb-2">Tactics:</h4>
                  <ul className="text-sm space-y-1">
                    {channel.tactics.map((tactic, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Facebook Community Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Facebook Community Strategy
          </CardTitle>
          <CardDescription>Build engaged community of church leaders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Platform</p>
              <p className="font-bold">{communityStrategy.platform}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Community Name</p>
              <p className="font-bold">{communityStrategy.name}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Year 1 Target</p>
              <p className="font-bold">{communityStrategy.target}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Content Strategy:</h4>
            <div className="space-y-3">
              {communityStrategy.content.map((content) => (
                <div key={content.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{content.type}</h5>
                    <span className="text-sm text-muted-foreground">{content.frequency}</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {content.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Engagement Tactics:</h4>
            <ul className="text-sm space-y-1">
              {communityStrategy.engagement.map((tactic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Referral Program
          </CardTitle>
          <CardDescription>Turn customers into advocates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-purple-900 mb-2">{referralProgram.structure}</h3>
            <p className="text-sm text-muted-foreground">Incentivize word-of-mouth growth</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Program Rules:</h4>
            <ul className="text-sm space-y-2">
              {referralProgram.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Implementation:</h4>
            <ul className="text-sm space-y-1">
              {referralProgram.implementation.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Projected Referrals:</h4>
            <div className="space-y-2">
              {referralProgram.projections.map((projection, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>{projection}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Marketing Strategy
          </CardTitle>
          <CardDescription>Monthly highlights and nurture campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Frequency</p>
              <p className="font-bold">{emailStrategy.frequency}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Newsletter Name</p>
              <p className="font-bold">{emailStrategy.name}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Email Segments:</h4>
            <div className="space-y-3">
              {emailStrategy.segments.map((segment) => (
                <div key={segment.name} className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-1">{segment.name}</h5>
                  <p className="text-sm text-muted-foreground">{segment.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Content Types:</h4>
            <ul className="text-sm space-y-1">
              {emailStrategy.content.map((content, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{content}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Event Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Church Event & Networking Strategy
          </CardTitle>
          <CardDescription>Build relationships with church leaders in person</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {eventStrategy.types.map((type) => (
              <div key={type.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold">{type.type}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.frequency} • {type.investment}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold mb-1">Examples:</p>
                  <ul className="text-sm space-y-1">
                    {type.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Event Tactics:</h4>
            <ul className="text-sm space-y-1">
              {eventStrategy.tactics.map((tactic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* CAC Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Customer Acquisition Cost (CAC) Analysis
          </CardTitle>
          <CardDescription>Unit economics and profitability metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Blended CAC</p>
              <p className="text-2xl font-bold text-blue-600">{cacCalculation.blendedCAC}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Customer LTV</p>
              <p className="text-2xl font-bold text-green-600">${cacCalculation.ltv}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">LTV:CAC Ratio</p>
              <p className="text-2xl font-bold text-purple-600">{cacCalculation.ltvCacRatio}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
              <p className="text-2xl font-bold text-orange-600">{cacCalculation.paybackPeriod}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">CAC by Channel:</h4>
            <div className="space-y-2">
              {cacCalculation.breakdown.map((item) => (
                <div key={item.channel} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.channel}</p>
                    <p className="text-sm text-muted-foreground">CAC: {item.cac}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.volume}</p>
                    <p className="text-xs text-muted-foreground">of volume</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Key Insights:</h4>
            <ul className="text-sm space-y-1">
              {cacCalculation.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Timeline */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-bold">Month 1-2: Foundation</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Launch Facebook community and begin daily content</li>
                <li>• Set up Facebook/Instagram ad campaigns with launch pricing</li>
                <li>• Create email newsletter template and first edition</li>
                <li>• Build referral program into dashboard</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-bold">Month 3-6: Scale</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Increase ad spend based on CAC performance</li>
                <li>• Host first church leader interviews in community</li>
                <li>• Attend 2-3 church conferences</li>
                <li>• Launch monthly email highlights</li>
                <li>• Activate referral program with first customers</li>
              </ul>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-bold">Month 7-12: Optimize</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Optimize ad campaigns based on data</li>
                <li>• Scale community to 500+ members</li>
                <li>• Host local church leader meetups</li>
                <li>• Refine email segmentation and personalization</li>
                <li>• Measure and improve referral conversion rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-8 border-t">
        <p className="font-semibold text-red-600 mb-2">CONFIDENTIAL</p>
        <p>Daily One Accord Marketing Strategy</p>
        <p>© 2025 Daily One Accord. All rights reserved.</p>
      </div>
    </div>
  )
}
