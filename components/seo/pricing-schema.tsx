export function PricingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Product",
        name: "Daily One Accord - Starter Plan",
        description: "Perfect for small churches getting started with church management software",
        brand: {
          "@type": "Brand",
          name: "Daily One Accord",
        },
        offers: {
          "@type": "Offer",
          price: "39",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
          availability: "https://schema.org/InStock",
          url: "https://dailyoneaccord.com/pricing",
          seller: {
            "@type": "Organization",
            name: "Daily One Accord",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.7",
          reviewCount: "45",
        },
      },
      {
        "@type": "Product",
        name: "Daily One Accord - Growth Plan",
        description: "For growing churches that need advanced features and priority support",
        brand: {
          "@type": "Brand",
          name: "Daily One Accord",
        },
        offers: {
          "@type": "Offer",
          price: "89",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
          availability: "https://schema.org/InStock",
          url: "https://dailyoneaccord.com/pricing",
          seller: {
            "@type": "Organization",
            name: "Daily One Accord",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "62",
        },
      },
      {
        "@type": "Product",
        name: "Daily One Accord - Enterprise Plan",
        description: "For large churches and multi-site organizations with custom needs",
        brand: {
          "@type": "Brand",
          name: "Daily One Accord",
        },
        offers: {
          "@type": "Offer",
          price: "199",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
          availability: "https://schema.org/InStock",
          url: "https://dailyoneaccord.com/pricing",
          seller: {
            "@type": "Organization",
            name: "Daily One Accord",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          reviewCount: "20",
        },
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
