// Stripe Price IDs Configuration
// These are the Price IDs from your Stripe dashboard

export const STRIPE_PRICE_IDS = {
  // Subscription Plans
  starter: "price_1SKKkoEEOYEaadfUEmwsqmve",
  growth: "price_1SL1PpEEOYEaadfUBxrb0vef", // Updated Growth plan to new $79 price ID
  enterprise: "price_1SKKqlEEOYEaadfUKme92ER9",
  additionalSeat: "price_1SKKsKEEOYEaadfU3S83xI1v",

  socialMediaAddon: "price_1SL1PqEEOYEaadfU6gvdJDmL", // Added Social Media add-on price ID

  // Setup Fees (One-time charges)
  setupFees: {
    standard: "price_1SKKtKEEOYEaadfU7E4tkNpP", // $199
    promotional: "price_1SKKuWEEOYEaadfU76R9TL4v", // $149
    launch: "price_1SKKvUEEOYEaadfUfd4MMRWk", // $79
  },
} as const

export const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: 24, // Updated from $39 to $24
    priceId: STRIPE_PRICE_IDS.starter,
    minSeats: 3, // Added seat range
    maxSeats: 10, // Added seat range
    includedSeats: 10, // Updated to reflect flat-rate model (3-10 seats)
    additionalSeatPrice: 0, // No per-seat charges within range
    transactionFeePercent: 3.1,
    features: [
      "3-10 Slack seats (flat rate)",
      "Visitor management kanban",
      "Attendance tracking",
      "Event management",
      "Team collaboration tools",
      "Slack integration",
      "Basic reporting",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    price: 79, // Updated from $89 to $79
    priceId: STRIPE_PRICE_IDS.growth,
    minSeats: 3, // Added seat range
    maxSeats: 20, // Added seat range
    includedSeats: 20, // Updated to reflect flat-rate model (3-20 seats)
    additionalSeatPrice: 0, // No per-seat charges within range
    transactionFeePercent: 2.9,
    features: [
      "3-20 Slack seats (flat rate)",
      "Everything in Starter",
      "Social media posting INCLUDED", // Now included, not an add-on
      "Advanced Slack workflows",
      "Advanced reporting",
      "Multi-channel notifications",
      "Email support",
    ],
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    priceId: STRIPE_PRICE_IDS.enterprise,
    minSeats: 1, // Added for consistency
    maxSeats: 999, // Unlimited represented as 999
    includedSeats: 999, // Unlimited seats
    additionalSeatPrice: 0, // No per-seat charges
    transactionFeePercent: 2.2,
    features: [
      "Unlimited Slack seats",
      "Everything in Growth",
      "API access",
      "Advanced security",
      "Custom training",
      "Email support",
    ],
  },
} as const

export const ADDON_DETAILS = {
  socialMedia: {
    name: "Social Media Scheduling",
    price: 14,
    priceId: STRIPE_PRICE_IDS.socialMediaAddon,
    description: "Schedule and publish posts to Facebook, Instagram, and other platforms",
    features: [
      "Schedule posts to Facebook & Instagram",
      "Calendar view of scheduled content",
      "Post history and analytics",
      "Media library integration",
      "Multi-account support",
    ],
    availableFor: ["starter"] as const, // Only available as add-on for Starter plan
    includedIn: ["growth", "enterprise"] as const, // Included in Growth and Enterprise
  },
} as const

export const SETUP_FEE_DETAILS = {
  standard: {
    tier: "standard",
    amount: 199,
    priceId: STRIPE_PRICE_IDS.setupFees.standard,
    name: "Standard Setup",
    description: "Complete onboarding and training",
  },
  promotional: {
    tier: "promotional",
    amount: 149,
    priceId: STRIPE_PRICE_IDS.setupFees.promotional,
    name: "Promotional Setup",
    description: "Limited time offer for new customers",
  },
  launch: {
    tier: "launch",
    amount: 79,
    priceId: STRIPE_PRICE_IDS.setupFees.launch,
    name: "Launch Special",
    description: "Early adopter pricing",
  },
} as const

export type PlanType = keyof typeof PLAN_DETAILS
export type SetupFeeTier = keyof typeof SETUP_FEE_DETAILS
export type AddonType = keyof typeof ADDON_DETAILS
