"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Copy, Eye, Code, Palette, BarChart3 } from "lucide-react"
import { PLAN_DETAILS } from "@/lib/stripe/config"
import { EmbeddablePricingWidget } from "@/components/pricing/embeddable-pricing-widget"

export function PricingManagementView() {
  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: "#3b82f6",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    borderRadius: "8",
    showComparison: true,
    showMonthlyOnly: true,
    highlightPlan: "growth",
  })

  const generateEmbedCode = () => {
    const config = encodeURIComponent(JSON.stringify(widgetConfig))
    return `<iframe 
  src="${process.env.NEXT_PUBLIC_SITE_URL}/embed/pricing?config=${config}" 
  width="100%" 
  height="900" 
  frameborder="0"
  style="border: none; border-radius: ${widgetConfig.borderRadius}px;"
></iframe>`
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    alert("Embed code copied to clipboard!")
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pricing Management</h1>
        <p className="text-muted-foreground">
          Manage subscription packages, customize embeddable widgets, and view platform comparisons
        </p>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="packages">
            <BarChart3 className="h-4 w-4 mr-2" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="embed">
            <Code className="h-4 w-4 mr-2" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="customize">
            <Palette className="h-4 w-4 mr-2" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Subscription Packages</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                <Card key={key} className="p-6 border-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.popular && (
                      <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {typeof plan.includedSeats === "number"
                        ? `${plan.includedSeats} team members included`
                        : "Unlimited team members"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transaction Fee:</span>
                      <span className="font-medium">{plan.transactionFeePercent}%</span>
                    </div>
                    {typeof plan.additionalSeatPrice === "number" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Additional Seats:</span>
                        <span className="font-medium">${plan.additionalSeatPrice}/month</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Platform Comparison */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Why Daily One Accord?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4 text-lg">Advantages Over Competitors</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <div>
                      <strong>All-in-One Platform:</strong> Unlike Planning Center or Church Community Builder, we
                      integrate attendance, events, visitors, SMS, and Slack in one unified system
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <div>
                      <strong>Transparent Pricing:</strong> No hidden fees or per-feature charges. Everything included
                      in your plan
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <div>
                      <strong>Modern Technology:</strong> Built with the latest tech stack for speed, reliability, and
                      mobile-first design
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <div>
                      <strong>Slack Integration:</strong> Native Slack bot for attendance tracking - no other platform
                      offers this
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <div>
                      <strong>Affordable Setup:</strong> Starting at $79 vs $500+ setup fees from competitors
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-lg">Comparison Table</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Feature</th>
                        <th className="text-center p-3">Daily One Accord</th>
                        <th className="text-center p-3">Others</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3">Starting Price</td>
                        <td className="text-center p-3 font-semibold text-primary">$39/mo</td>
                        <td className="text-center p-3 text-muted-foreground">$50-100/mo</td>
                      </tr>
                      <tr>
                        <td className="p-3">Setup Fee</td>
                        <td className="text-center p-3 font-semibold text-primary">$79+</td>
                        <td className="text-center p-3 text-muted-foreground">$500+</td>
                      </tr>
                      <tr>
                        <td className="p-3">Slack Integration</td>
                        <td className="text-center p-3 text-primary">✓</td>
                        <td className="text-center p-3 text-muted-foreground">✗</td>
                      </tr>
                      <tr>
                        <td className="p-3">SMS Included</td>
                        <td className="text-center p-3 text-primary">✓</td>
                        <td className="text-center p-3 text-muted-foreground">Extra Cost</td>
                      </tr>
                      <tr>
                        <td className="p-3">Mobile App</td>
                        <td className="text-center p-3 text-primary">✓</td>
                        <td className="text-center p-3 text-muted-foreground">Limited</td>
                      </tr>
                      <tr>
                        <td className="p-3">Support</td>
                        <td className="text-center p-3 text-primary">24/7</td>
                        <td className="text-center p-3 text-muted-foreground">Business Hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Embed Code Tab */}
        <TabsContent value="embed" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Embed Code</h2>
            <p className="text-muted-foreground mb-6">
              Copy this code and paste it into your WordPress site, landing page, or any HTML page to display the
              pricing widget.
            </p>

            <div className="space-y-4">
              <div>
                <Label>Embed Code (HTML)</Label>
                <div className="relative mt-2">
                  <Textarea
                    value={generateEmbedCode()}
                    readOnly
                    className="font-mono text-sm h-32 pr-12"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={copyEmbedCode}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">WordPress Instructions:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Copy the embed code above</li>
                  <li>Go to your WordPress page editor</li>
                  <li>Add a "Custom HTML" block</li>
                  <li>Paste the embed code</li>
                  <li>Publish or update your page</li>
                </ol>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Direct Link:</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${process.env.NEXT_PUBLIC_SITE_URL}/embed/pricing?config=${encodeURIComponent(JSON.stringify(widgetConfig))}`}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${process.env.NEXT_PUBLIC_SITE_URL}/embed/pricing?config=${encodeURIComponent(JSON.stringify(widgetConfig))}`,
                      )
                      alert("Link copied!")
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Customize Tab */}
        <TabsContent value="customize" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Customize Widget Appearance</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={widgetConfig.accentColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, accentColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={widgetConfig.accentColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, accentColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={widgetConfig.backgroundColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, backgroundColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={widgetConfig.backgroundColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, backgroundColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={widgetConfig.textColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, textColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={widgetConfig.textColor}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, textColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="borderRadius">Border Radius (px)</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={widgetConfig.borderRadius}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, borderRadius: e.target.value })}
                    className="mt-2"
                    min="0"
                    max="24"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showComparison">Show Platform Comparison</Label>
                    <p className="text-sm text-muted-foreground">Display comparison with competitors</p>
                  </div>
                  <Switch
                    id="showComparison"
                    checked={widgetConfig.showComparison}
                    onCheckedChange={(checked) => setWidgetConfig({ ...widgetConfig, showComparison: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showMonthlyOnly">Monthly Subscriptions Only</Label>
                    <p className="text-sm text-muted-foreground">Hide annual billing options</p>
                  </div>
                  <Switch
                    id="showMonthlyOnly"
                    checked={widgetConfig.showMonthlyOnly}
                    onCheckedChange={(checked) => setWidgetConfig({ ...widgetConfig, showMonthlyOnly: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="highlightPlan">Highlighted Plan</Label>
                  <select
                    id="highlightPlan"
                    value={widgetConfig.highlightPlan}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, highlightPlan: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth (Recommended)</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Quick Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setWidgetConfig({
                          ...widgetConfig,
                          primaryColor: "#3b82f6",
                          accentColor: "#10b981",
                          backgroundColor: "#ffffff",
                          textColor: "#1f2937",
                        })
                      }
                    >
                      Default
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setWidgetConfig({
                          ...widgetConfig,
                          primaryColor: "#8b5cf6",
                          accentColor: "#ec4899",
                          backgroundColor: "#faf5ff",
                          textColor: "#1f2937",
                        })
                      }
                    >
                      Purple
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setWidgetConfig({
                          ...widgetConfig,
                          primaryColor: "#0f172a",
                          accentColor: "#3b82f6",
                          backgroundColor: "#ffffff",
                          textColor: "#0f172a",
                        })
                      }
                    >
                      Dark
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setWidgetConfig({
                          ...widgetConfig,
                          primaryColor: "#059669",
                          accentColor: "#0891b2",
                          backgroundColor: "#f0fdf4",
                          textColor: "#064e3b",
                        })
                      }
                    >
                      Green
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Live Preview</h2>
                <p className="text-muted-foreground">See how your pricing widget will look on external sites</p>
              </div>
              <Button onClick={copyEmbedCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
            </div>

            <div className="border rounded-lg p-8" style={{ backgroundColor: widgetConfig.backgroundColor }}>
              <EmbeddablePricingWidget config={widgetConfig} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
