import type { Metadata } from "next"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import WaitlistClient from "./waitlist-client"

export const metadata: Metadata = {
  title: "Join the Waitlist - Be First to Experience Daily One Accord",
  description:
    "Join the Daily One Accord waitlist and be among the first to experience the future of church management. Get exclusive early access and special launch pricing.",
  keywords: [
    "church software waitlist",
    "early access church management",
    "church software launch",
    "daily one accord waitlist",
  ],
  openGraph: {
    title: "Join the Waitlist | Daily One Accord",
    description:
      "Be among the first to experience the future of church management. Join our waitlist for exclusive early access.",
    type: "website",
    url: "/waitlist",
  },
  alternates: {
    canonical: "/waitlist",
  },
}

export default function WaitlistPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "Waitlist", url: "https://dailyoneaccord.com/waitlist" },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <WaitlistClient />
    </>
  )
}
