import { HomePageClient } from "./homepage-client"

export const metadata = {
  title: "Daily One Accord - Stop Juggling Apps. Start Building Unity.",
  description:
    "Eliminate fragmented church communication with one unified platform. Daily One Accord creates cohesive communication that builds growth and accountability. Save $6K-$66K annually + get FREE Slack for churches.",
  keywords: [
    "church management software",
    "church software",
    "ministry management",
    "church giving platform",
    "church communication",
    "member management",
    "church events",
    "church analytics",
    "unified church platform",
    "slack church integration",
  ],
  openGraph: {
    title: "Daily One Accord - Stop Juggling Apps. Start Building Unity.",
    description:
      "Eliminate fragmented church communication with one unified platform. Save $6K-$66K annually + get FREE Slack for churches.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Daily One Accord Church Management Software Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily One Accord - Stop Juggling Apps. Start Building Unity.",
    description:
      "Eliminate fragmented church communication with one unified platform. Save $6K-$66K annually + get FREE Slack.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
