"use client"

import { Download, DollarSign, TrendingUp, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FinancialProjectionsContent() {
  const handleDownloadPDF = () => {
    window.print()
  }

  const financialData = {
    years: [
      {
        year: 2025,
        revenue: 240000,
        profit: 120000,
        customers: { start: 0, end: 200, avg: 100 },
        arpu: 200,
        margin: 50,
      },
      {
        year: 2026,
        revenue: 840000,
        profit: 450000,
        customers: { start: 200, end: 500, avg: 350 },
        arpu: 200,
        margin: 53,
      },
      {
        year: 2027,
        revenue: 1800000,
        profit: 1070000,
        customers: { start: 500, end: 1000, avg: 750 },
        arpu: 200,
        margin: 59,
      },
      {
        year: 2028,
        revenue: 3600000,
        profit: 2250000,
        customers: { start: 1000, end: 2000, avg: 1500 },
        arpu: 200,
        margin: 62,
      },
    ],
  }

  const pricingTiers = [
    {
      name: "Starter",
      price: 24,
      setup: 199,
      features: "3-10 Slack seats, Core features",
      addons: "Social Media: +$14/month",
    },
    {
      name: "Growth",
      price: 79,
      setup: 199,
      features: "3-20 Slack seats, Social Media included",
      addons: "None",
    },
    {
      name: "Enterprise",
      price: 199,
      setup: 199,
      features: "Unlimited Slack seats, All features",
      addons: "Custom integrations available",
    },
  ]

  const revenueStreams = [
    {
      stream: "SaaS Subscriptions",
      description: "$24-$199/month based on team size",
      recurring: true,
    },
    {
      stream: "Setup Fees",
      description: "$199 one-time per church",
      recurring: false,
    },
    {
      stream: "Add-ons",
      description: "Social Media posting ($14/month for Starter)",
      recurring: true,
    },
  ]

  const costStructure = [
    { category: "Marketing & Customer Acquisition", percentage: 30 },
    { category: "Sales Team & Support", percentage: 20 },
    { category: "Infrastructure & Hosting", percentage: 10 },
    { category: "Operations & Administration", percentage: 15 },
    { category: "Product Development", percentage: 15 },
    { category: "Contingency", percentage: 10 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Financial Projections</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive financial overview and revenue projections for Daily One Accord
          </p>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Daily One Accord</h1>
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">Financial Projections</h2>
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
            Daily One Accord is a production-ready SaaS platform targeting the $1.8B+ church management software market.
            With transparent pricing starting at $24/month and a comprehensive feature set, we project strong growth
            from 100 churches in Year 1 to 1,500 churches by Year 4.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Year 1 Revenue</p>
              <p className="text-2xl font-bold text-blue-600">$240K</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Year 4 Revenue</p>
              <p className="text-2xl font-bold text-green-600">$3.6M</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Year 4 Profit</p>
              <p className="text-2xl font-bold text-purple-600">$2.25M</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Target Customers</p>
              <p className="text-2xl font-bold text-orange-600">1,500</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            4-Year Revenue Projections
          </CardTitle>
          <CardDescription>Annual revenue and profit forecasts (2025-2028)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Year</th>
                  <th className="text-right py-3 px-4 font-semibold">Customers</th>
                  <th className="text-right py-3 px-4 font-semibold">ARPU</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Margin</th>
                </tr>
              </thead>
              <tbody>
                {financialData.years.map((year) => (
                  <tr key={year.year} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{year.year}</td>
                    <td className="text-right py-3 px-4">
                      {year.customers.start} → {year.customers.end}
                      <span className="text-sm text-muted-foreground ml-2">(avg: {year.customers.avg})</span>
                    </td>
                    <td className="text-right py-3 px-4">${year.arpu}/mo</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">
                      ${year.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-blue-600">
                      ${year.profit.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">{year.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Key Assumptions:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Average revenue per customer: $200/month (mix of Starter, Growth, Enterprise)</li>
              <li>Customer acquisition accelerates with marketing investment</li>
              <li>Profit margins improve from 50% to 62% as platform scales</li>
              <li>Churn rate: 5-8% annually (industry standard for church software)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Pricing Structure
          </CardTitle>
          <CardDescription>Transparent, all-inclusive pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">+ ${tier.setup} setup (one-time)</p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{tier.features}</p>
                  <p className="text-muted-foreground">{tier.addons}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold mb-2">What's Included (All Tiers):</h4>
            <ul className="text-sm space-y-1 list-disc list-inside grid grid-cols-1 md:grid-cols-2 gap-2">
              <li>Member & attendance management</li>
              <li>Event calendar & registration</li>
              <li>Email, SMS, Slack integration</li>
              <li>Team management & scheduling</li>
              <li>Visitor pipeline & follow-up</li>
              <li>Analytics & reporting</li>
              <li>Mobile access & unlimited users</li>
              <li>Customer support & updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Streams</CardTitle>
          <CardDescription>Multiple revenue sources for sustainable growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueStreams.map((stream) => (
              <div key={stream.stream} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div className="flex-1">
                  <h4 className="font-semibold">{stream.stream}</h4>
                  <p className="text-sm text-muted-foreground">{stream.description}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      stream.recurring ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {stream.recurring ? "Recurring" : "One-time"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold mb-2">Giving System (Stripe Connect):</h4>
            <p className="text-sm">
              Churches connect their own Stripe account and pay Stripe directly (2.9% + $0.30 per transaction). Daily
              One Accord takes NO transaction fees - churches keep 100% of donations minus Stripe's standard fees. This
              builds trust and positions us as a partner, not a middleman.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cost Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Structure</CardTitle>
          <CardDescription>Allocation of operating expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costStructure.map((cost) => (
              <div key={cost.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cost.category}</span>
                  <span className="text-muted-foreground">{cost.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${cost.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Capital Efficiency:</h4>
            <p className="text-sm">
              Platform is production-ready, eliminating technical risk. Investment funds go directly to customer
              acquisition and scaling operations, not product development. This creates faster ROI and lower risk for
              investors.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Market Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">US Churches</p>
              <p className="text-2xl font-bold">300,000+</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Annual Giving</p>
              <p className="text-2xl font-bold">$50B+</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Addressable Market</p>
              <p className="text-2xl font-bold">$1.8B+</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed">
            Churches currently spend $500-$2,000/month on fragmented software tools (Planning Center, Mailchimp, Slack,
            giving platforms, etc.). Our target is 50,000 small-to-mid-sized churches (50-500 members) seeking unified
            platforms. Capturing just 1% of this market represents $7.4M+ in annual recurring revenue.
          </p>
        </CardContent>
      </Card>

      {/* Investment Ask */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Investment Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Seeking:</h4>
              <p className="text-2xl font-bold text-blue-600">$150K-$300K</p>
              <p className="text-sm text-muted-foreground">Seed investment for 15-20% equity</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Use of Funds:</h4>
              <ul className="text-sm space-y-1">
                <li>• Customer acquisition & marketing</li>
                <li>• Sales team hiring</li>
                <li>• Church conference presence</li>
                <li>• Strategic partnerships</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2">Why Invest Now:</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Production-ready platform</strong> - Technical risk eliminated, ready to scale
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Large addressable market</strong> - $1.8B+ with clear customer pain points
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Predictable SaaS revenue</strong> - Not dependent on transaction fees
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Capital efficient</strong> - Investment goes to growth, not development
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Clear path to profitability</strong> - 50%+ margins from Year 1
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-8 border-t">
        <p className="font-semibold text-red-600 mb-2">CONFIDENTIAL</p>
        <p>Daily One Accord Financial Projections</p>
        <p>© 2025 Daily One Accord. All rights reserved.</p>
      </div>
    </div>
  )
}
