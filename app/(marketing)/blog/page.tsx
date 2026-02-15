import type { Metadata } from "next"
import BlogClient from "./blog-client"
import { createServerClient } from "@/lib/supabase/server"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createServerClient()
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)

    const featuredPost = posts?.[0]

    if (featuredPost) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dailyoneaccord.com"
      const postUrl = `${siteUrl}/blog`

      return {
        title: featuredPost.meta_title || `${featuredPost.title} | Daily One Accord Blog`,
        description:
          featuredPost.meta_description || featuredPost.excerpt || "Insights and best practices for church management",
        keywords: featuredPost.meta_keywords || ["church management", "ministry", "church software"],
        openGraph: {
          title: featuredPost.og_title || featuredPost.title,
          description: featuredPost.og_description || featuredPost.excerpt || "",
          url: postUrl,
          type: "article",
          images:
            featuredPost.og_image || featuredPost.featured_image_url
              ? [
                  {
                    url: featuredPost.og_image || featuredPost.featured_image_url || "",
                    width: 1200,
                    height: 630,
                    alt: featuredPost.title,
                  },
                ]
              : [],
          publishedTime: featuredPost.published_at,
        },
        twitter: {
          card: (featuredPost.twitter_card_type as any) || "summary_large_image",
          title: featuredPost.og_title || featuredPost.title,
          description: featuredPost.og_description || featuredPost.excerpt || "",
          images:
            featuredPost.og_image || featuredPost.featured_image_url
              ? [featuredPost.og_image || featuredPost.featured_image_url]
              : [],
        },
        alternates: {
          canonical: postUrl,
        },
      }
    }
  } catch (error) {
    console.error("[v0] Error generating blog metadata:", error)
  }

  // Fallback metadata
  return {
    title: "Blog | Daily One Accord",
    description: "Insights, best practices, and updates to help your church thrive",
    keywords: ["church management blog", "church software insights", "ministry best practices"],
    openGraph: {
      title: "Blog | Daily One Accord",
      description: "Insights, best practices, and updates to help your church thrive",
      url: "/blog",
    },
    alternates: {
      canonical: "/blog",
    },
  }
}

export default function BlogPage() {
  return <BlogClient />
}
