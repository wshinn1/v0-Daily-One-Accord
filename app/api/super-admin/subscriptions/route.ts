import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, UnauthorizedError } from "@/lib/errors/handler"
import Stripe from "stripe"
import { ADDON_DETAILS } from "@/lib/stripe/config"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export const GET = asyncHandler(async () => {
  const supabase = await createClient()

  // Check if user is super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError("Not authenticated")
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    throw new UnauthorizedError("Super admin access required")
  }

  // Fetch all church tenants with subscription data
  const { data: tenants, error } = await supabase
    .from("church_tenants")
    .select(
      `
      id,
      name,
      church_code,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_plan,
      subscription_status,
      subscription_start_date,
      subscription_addons,
      mrr,
      created_at
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  const totalTenants = tenants.length
  const activeSubs = tenants.filter((t) => t.subscription_status === "active").length

  // Calculate total MRR including add-ons
  let totalMRR = 0
  let totalAddonRevenue = 0

  tenants.forEach((tenant) => {
    // Base subscription MRR
    totalMRR += Number(tenant.mrr) || 0

    // Add-on MRR
    if (tenant.subscription_addons && Array.isArray(tenant.subscription_addons)) {
      tenant.subscription_addons.forEach((addonKey: string) => {
        if (addonKey === "social_media") {
          totalAddonRevenue += ADDON_DETAILS.socialMedia.price
        }
      })
    }
  })

  totalMRR += totalAddonRevenue

  const churnRate = totalTenants > 0 ? ((totalTenants - activeSubs) / totalTenants) * 100 : 0

  // Plan breakdown with add-on tracking
  const starterCount = tenants.filter((t) => t.subscription_plan === "starter").length
  const starterWithAddon = tenants.filter(
    (t) =>
      t.subscription_plan === "starter" &&
      t.subscription_addons &&
      Array.isArray(t.subscription_addons) &&
      t.subscription_addons.includes("social_media"),
  ).length

  const planBreakdown = {
    starter: starterCount,
    starterWithSocialMedia: starterWithAddon,
    growth: tenants.filter((t) => t.subscription_plan === "growth").length,
    enterprise: tenants.filter((t) => t.subscription_plan === "enterprise").length,
  }

  return NextResponse.json({
    tenants,
    metrics: {
      totalTenants,
      activeSubscriptions: activeSubs,
      totalMRR: totalMRR.toFixed(2),
      totalAddonRevenue: totalAddonRevenue.toFixed(2),
      churnRate: churnRate.toFixed(2),
      planBreakdown,
    },
  })
})
