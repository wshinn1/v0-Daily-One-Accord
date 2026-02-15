import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with Daily One Accord",
  description:
    "Have questions about Daily One Accord church management software? Contact our team for support, sales inquiries, or general questions. We typically respond within 24 hours.",
  keywords: ["contact daily one accord", "church software support", "church management help", "sales inquiry"],
  openGraph: {
    title: "Contact Us - Get in Touch | Daily One Accord",
    description:
      "Have questions about our church management software? Contact our team for support or sales inquiries.",
    type: "website",
    url: "/contact",
  },
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
