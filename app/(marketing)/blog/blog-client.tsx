"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, Share2, Facebook, Twitter, Linkedin, LinkIcon } from "lucide-react"
import { UnifiedCTA } from "@/components/marketing/unified-cta"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url?: string
  category?: { id: string; name: string; slug: string }
  author_name: string
  published_at: string
  read_time_minutes?: number
}

export default function BlogClient() {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchFeaturedPost()
  }, [])

  const fetchFeaturedPost = async () => {
    try {
      const response = await fetch("/api/blog/posts?featured=true")
      const data = await response.json()
      if (data.posts && data.posts.length > 0) {
        setFeaturedPost(data.posts[0])
      }
    } catch (error) {
      console.error("[v0] Error fetching featured post:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!featuredPost) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">The Daily One Accord Blog</h1>
              <p className="text-xl text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(featuredPost?.title || "")}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy link:", err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Subheadline */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">The Daily One Accord Blog</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">
              Insights, best practices, and updates to help your church thrive
            </p>
          </div>
        </div>
      </section>

      {/* Featured Blog Post */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {featuredPost.featured_image_url && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img
                  src={featuredPost.featured_image_url || "/placeholder.svg"}
                  alt={featuredPost.title}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {featuredPost.category && (
                <Badge variant="secondary" className="text-sm">
                  {featuredPost.category.name}
                </Badge>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{featuredPost.author_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(featuredPost.published_at).toLocaleDateString()}</span>
                </div>
                {featuredPost.read_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.read_time_minutes} min read</span>
                  </div>
                )}
              </div>
            </div>

            {/* Post Title */}
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">{featuredPost.title}</h2>

            {/* Post Excerpt */}
            {featuredPost.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 text-pretty">{featuredPost.excerpt}</p>
            )}

            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: featuredPost.content.replace(/\n/g, "<br />"),
                }}
              />
            </div>

            {/* Social Sharing Buttons */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share this post
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={shareOnTwitter} title="Share on Twitter/X">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareOnFacebook} title="Share on Facebook">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyLink} title="Copy link">
                    <LinkIcon className="h-4 w-4" />
                    {copied && <span className="ml-2 text-xs">Copied!</span>}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* UnifiedCTA Component */}
      <UnifiedCTA />
    </div>
  )
}
