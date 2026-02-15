"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ImageIcon, BarChart3, Settings, CheckCircle2, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface SeoSettings {
  id: string
  site_title: string
  site_description: string
  site_keywords: string
  og_image_url: string | null
  favicon_url: string | null
  twitter_handle: string | null
  google_analytics_id: string | null
  google_site_verification: string | null
  facebook_pixel_id: string | null
  canonical_domain: string
  robots_allow_indexing: boolean
  sitemap_enabled: boolean
  schema_org_enabled: boolean
}

interface SeoSettingsViewProps {
  initialSettings: SeoSettings | null
}

export function SeoSettingsView({ initialSettings }: SeoSettingsViewProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<SeoSettings>(
    initialSettings || {
      id: "",
      site_title: "Daily One Accord - Church Management Software",
      site_description:
        "All-in-one church management platform with member tracking, event planning, communication tools, and more.",
      site_keywords: "church management, church software, member management, event planning, church communication",
      og_image_url: null,
      favicon_url: null,
      twitter_handle: null,
      google_analytics_id: null,
      google_site_verification: null,
      facebook_pixel_id: null,
      canonical_domain: "https://dailyoneaccord.com",
      robots_allow_indexing: true,
      sitemap_enabled: true,
      schema_org_enabled: true,
    },
  )
  const [loading, setLoading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [uploadingOgImage, setUploadingOgImage] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (file: File, type: "favicon" | "og_image") => {
    const setUploading = type === "favicon" ? setUploadingFavicon : setUploadingOgImage
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("oldUrl", type === "favicon" ? settings.favicon_url || "" : settings.og_image_url || "")

      const response = await fetch("/api/super-admin/upload-seo-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()

      if (type === "favicon") {
        setSettings({ ...settings, favicon_url: data.url })
      } else {
        setSettings({ ...settings, og_image_url: data.url })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const response = await fetch("/api/super-admin/seo-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save settings")
      }

      setSuccess(true)
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground mt-2">Manage site-wide SEO configuration and metadata</p>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">SEO settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Search className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="social">
              <ImageIcon className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic SEO Settings</CardTitle>
                <CardDescription>Configure the default meta tags for your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-title">Site Title</Label>
                  <Input
                    id="site-title"
                    value={settings.site_title}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                    placeholder="Daily One Accord - Church Management Software"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in browser tabs and search results (50-60 characters recommended)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={settings.site_description}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    placeholder="All-in-one church management platform..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in search results (150-160 characters recommended)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-keywords">Keywords</Label>
                  <Input
                    id="site-keywords"
                    value={settings.site_keywords}
                    onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
                    placeholder="church management, church software, member management"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated keywords (less important for modern SEO)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical-domain">Canonical Domain</Label>
                  <Input
                    id="canonical-domain"
                    value={settings.canonical_domain}
                    onChange={(e) => setSettings({ ...settings, canonical_domain: e.target.value })}
                    placeholder="https://dailyoneaccord.com"
                  />
                  <p className="text-xs text-muted-foreground">Your primary domain (used for canonical URLs)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favicon</CardTitle>
                <CardDescription>Upload your site favicon (appears in browser tabs)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Favicon</Label>
                  {settings.favicon_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={settings.favicon_url || "/placeholder.svg"}
                          alt="Favicon"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({ ...settings, favicon_url: null })}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No favicon uploaded</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon-upload">Upload New Favicon</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.ico"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, "favicon")
                      }}
                      disabled={uploadingFavicon}
                    />
                    {uploadingFavicon && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: 32x32px or 512x512px PNG/SVG (max 5MB)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Settings</CardTitle>
                <CardDescription>Configure Open Graph and Twitter Card metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Social Sharing Image</Label>
                  {settings.og_image_url ? (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-[1.91/1] border rounded-lg overflow-hidden bg-muted max-w-md">
                        <Image
                          src={settings.og_image_url || "/placeholder.svg"}
                          alt="OG Image"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({ ...settings, og_image_url: null })}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No social sharing image uploaded</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og-image-upload">Upload Social Sharing Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="og-image-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, "og_image")
                      }}
                      disabled={uploadingOgImage}
                    />
                    {uploadingOgImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x630px JPG/PNG for Facebook, LinkedIn, Twitter (max 5MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter-handle">Twitter Handle</Label>
                  <Input
                    id="twitter-handle"
                    value={settings.twitter_handle || ""}
                    onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
                    placeholder="@dailyoneaccord"
                  />
                  <p className="text-xs text-muted-foreground">Your Twitter/X username (include the @)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Tracking</CardTitle>
                <CardDescription>Configure analytics and tracking pixels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-analytics">Google Analytics ID</Label>
                  <Input
                    id="google-analytics"
                    value={settings.google_analytics_id || ""}
                    onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                  />
                  <p className="text-xs text-muted-foreground">Your Google Analytics measurement ID</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-verification">Google Site Verification</Label>
                  <Input
                    id="google-verification"
                    value={settings.google_site_verification || ""}
                    onChange={(e) => setSettings({ ...settings, google_site_verification: e.target.value })}
                    placeholder="google-site-verification=..."
                  />
                  <p className="text-xs text-muted-foreground">Verification code from Google Search Console</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebook-pixel"
                    value={settings.facebook_pixel_id || ""}
                    onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">Your Facebook Pixel ID for conversion tracking</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure technical SEO features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Search Engine Indexing</Label>
                    <p className="text-xs text-muted-foreground">Allow search engines to index your site</p>
                  </div>
                  <Switch
                    checked={settings.robots_allow_indexing}
                    onCheckedChange={(checked) => setSettings({ ...settings, robots_allow_indexing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable XML Sitemap</Label>
                    <p className="text-xs text-muted-foreground">Generate and serve XML sitemap at /sitemap.xml</p>
                  </div>
                  <Switch
                    checked={settings.sitemap_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, sitemap_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Schema.org Markup</Label>
                    <p className="text-xs text-muted-foreground">Add structured data for rich search results</p>
                  </div>
                  <Switch
                    checked={settings.schema_org_enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, schema_org_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Resources</CardTitle>
                <CardDescription>Quick links to SEO tools and documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Google Search Console</div>
                  <div className="text-xs text-muted-foreground">Monitor search performance</div>
                </a>
                <a
                  href={`${settings.canonical_domain}/sitemap.xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">View Sitemap</div>
                  <div className="text-xs text-muted-foreground">Check your XML sitemap</div>
                </a>
                <a
                  href={`${settings.canonical_domain}/robots.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-medium">View Robots.txt</div>
                  <div className="text-xs text-muted-foreground">Check crawler directives</div>
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/super-admin")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
