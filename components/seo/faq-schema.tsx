export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I get started with Daily One Accord?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Getting started is easy! Simply sign up for a free 7-day trial, no credit card required. Once you've created your account, you'll be guided through a quick setup process to configure your church profile, add team members, and import your member data.",
        },
      },
      {
        "@type": "Question",
        name: "What's included in the free trial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your 7-day free trial includes full access to all features in the Growth plan. You can add unlimited team members, import your data, and explore all the tools. No credit card is required to start your trial, and you can cancel anytime.",
        },
      },
      {
        "@type": "Question",
        name: "Can I change plans later?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and we'll prorate any charges or credits based on your billing cycle.",
        },
      },
      {
        "@type": "Question",
        name: "Is my church data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. We use enterprise-grade security measures including 256-bit SSL encryption, secure data centers, and regular security audits. All data is backed up daily, and we maintain SOC 2 Type II compliance. Your data is yours - we never share or sell it to third parties.",
        },
      },
      {
        "@type": "Question",
        name: "Can I send SMS messages to my congregation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! SMS messaging is included in the Growth and Enterprise plans. You can send personalized bulk messages, automated reminders, and targeted communications to specific groups.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a mobile app?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We offer native mobile apps for both iOS and Android. Your team can manage members, check-in attendees, send messages, and access all key features from their phones or tablets.",
        },
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
