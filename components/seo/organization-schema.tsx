export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Daily One Accord",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "39",
      highPrice: "199",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "39",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    provider: {
      "@type": "Organization",
      name: "Daily One Accord",
      url: "https://dailyoneaccord.com",
      logo: "https://dailyoneaccord.com/logo.png",
      description:
        "All-in-one church management software with member tracking, event planning, communication tools, and integrated giving.",
      foundingDate: "2024",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@dailyoneaccord.com",
        availableLanguage: "English",
      },
      sameAs: [
        "https://twitter.com/dailyoneaccord",
        "https://facebook.com/dailyoneaccord",
        "https://linkedin.com/company/dailyoneaccord",
      ],
    },
    featureList: [
      "Member Management",
      "Event Planning",
      "Communication Hub",
      "Analytics & Insights",
      "Digital Asset Management",
      "Slack Integration",
      "SMS Messaging",
      "Email Marketing",
      "Online Giving",
      "Social Media Scheduling",
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
