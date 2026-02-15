import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/super-admin/",
          "/setup-profile/",
          "/join/",
          "/signup/payment/",
          "/signup/success/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
