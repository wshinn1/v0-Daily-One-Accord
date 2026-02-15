/**
 * SEO utility functions for generating metadata and structured data
 */

interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  path: string
  image?: string
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  path,
  image = "/og-image.jpg",
}: PageMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"
  const url = `${baseUrl}${path}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | Daily One Accord`,
      description,
      type: "website" as const,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | Daily One Accord`,
      description,
      images: [image],
    },
    alternates: {
      canonical: path,
    },
  }
}

function getDefaultSEOSettings() {
  return {
    site_title: "Daily One Accord",
    site_description:
      "All-in-one church management software with member tracking, event planning, communication tools, and integrated giving.",
    default_og_image: "/og-image.jpg",
    twitter_handle: "@dailyoneaccord",
    google_analytics_id: null,
    facebook_pixel_id: null,
    google_site_verification: null,
    allow_indexing: true,
  }
}

export async function getSEOSettings() {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase.from("seo_settings").select("*").single()

    if (error) {
      console.log(
        "[v0] SEO settings table not found, using defaults. Run migration script 85 to enable database settings.",
      )
      return getDefaultSEOSettings()
    }

    if (!data) {
      return getDefaultSEOSettings()
    }

    return data
  } catch (error) {
    console.log("[v0] Error fetching SEO settings, using defaults:", error)
    return getDefaultSEOSettings()
  }
}

export async function generateMetadataWithSettings({ title, description, keywords = [], path, image }: PageMetadata) {
  const settings = await getSEOSettings()

  if (!settings) {
    return generatePageMetadata({ title, description, keywords, path, image })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"
  const url = `${baseUrl}${path}`
  const ogImage = image || settings.default_og_image || "/og-image.jpg"
  const fullTitle = title ? `${title} | ${settings.site_title}` : settings.site_title
  const metaDescription = description || settings.site_description

  return {
    title: fullTitle,
    description: metaDescription,
    keywords,
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      type: "website" as const,
      url,
      siteName: settings.site_title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || settings.site_title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: settings.twitter_handle || "@dailyoneaccord",
    },
    alternates: {
      canonical: path,
    },
    robots: settings.allow_indexing
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
    verification: settings.google_site_verification
      ? {
          google: settings.google_site_verification,
        }
      : undefined,
  }
}

export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  author = "Daily One Accord",
  image = "/og-image.jpg",
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  author?: string
  image?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: `${baseUrl}${image}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Daily One Accord",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
  }
}
