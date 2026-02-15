import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { OrganizationSchema } from "@/components/seo/organization-schema"
import { WebVitals } from "@/components/performance/web-vitals"
import { AnalyticsScripts } from "@/components/seo/analytics-scripts"
import { SentryProvider } from "@/components/providers/sentry-provider"
import { getSEOSettings } from "@/lib/seo-utils"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSEOSettings()

  if (!settings) {
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"),
      title: {
        default: "Daily One Accord - Church Management Software",
        template: "%s | Daily One Accord",
      },
      description:
        "All-in-one church management software with member tracking, event planning, communication tools, and integrated giving.",
    }
  }

  const icons = settings.favicon_url
    ? {
        icon: settings.favicon_url,
        apple: settings.favicon_url,
      }
    : undefined

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"),
    title: {
      default: settings.site_title,
      template: `%s | ${settings.site_title}`,
    },
    description: settings.site_description,
    keywords: settings.meta_keywords?.split(",").map((k: string) => k.trim()) || [],
    authors: [{ name: settings.site_title }],
    creator: settings.site_title,
    publisher: settings.site_title,
    icons,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: settings.site_title,
      title: settings.site_title,
      description: settings.site_description,
      images: [
        {
          url: settings.og_image_url || settings.default_og_image || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: settings.site_title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description,
      images: [settings.og_image_url || settings.default_og_image || "/og-image.jpg"],
      creator: settings.twitter_handle || "@dailyoneaccord",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <OrganizationSchema />
        <AnalyticsScripts />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans antialiased`}>
        <SentryProvider>
          <WebVitals />
          {children}
        </SentryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
