import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, UnauthorizedError, DatabaseError } from "@/lib/errors/handler"

export const GET = asyncHandler(async () => {
  console.log("[v0] Onboarding analytics API called")

  const supabase = await createClient()
  console.log("[v0] Supabase client created:", !!supabase)

  // Verify super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User fetched:", !!user)

  if (!user) throw new UnauthorizedError("Not authenticated")

  const { data: profile } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  console.log("[v0] Profile fetched:", profile)

  if (!profile?.is_super_admin) {
    throw new UnauthorizedError("Super admin access required")
  }

  // Get all church tenants with setup status
  const { data: tenants, error: tenantsError } = await supabase
    .from("church_tenants")
    .select("id, name, created_at, church_code")
    .order("created_at", { ascending: false })

  if (tenantsError) {
    console.error("[v0] Tenants fetch error:", tenantsError)
    throw new DatabaseError("Failed to fetch tenants", { originalError: tenantsError })
  }

  console.log("[v0] Tenants fetched:", tenants?.length)

  // Get setup status for each tenant
  const tenantsWithStatus = await Promise.all(
    (tenants || []).map(async (tenant) => {
      // Check lead admin
      const { data: leadAdmin } = await supabase
        .from("church_members")
        .select("id")
        .eq("church_tenant_id", tenant.id)
        .eq("role", "lead_admin")
        .limit(1)
        .maybeSingle()

      // Check Slack
      const { data: slackConfig } = await supabase
        .from("slack_bot_configs")
        .select("id")
        .eq("church_tenant_id", tenant.id)
        .limit(1)
        .maybeSingle()

      const setupStatus = {
        hasLeadAdmin: !!leadAdmin,
        hasAccessCode: !!tenant.church_code,
        hasSlack: !!slackConfig,
      }

      const completedSteps = Object.values(setupStatus).filter(Boolean).length
      const totalSteps = 3
      const completionPercentage = (completedSteps / totalSteps) * 100

      return {
        ...tenant,
        setupStatus,
        completedSteps,
        totalSteps,
        completionPercentage,
        isFullySetup: completedSteps === totalSteps,
      }
    }),
  )

  // Calculate funnel metrics
  const totalTenants = tenantsWithStatus.length
  const fullySetup = tenantsWithStatus.filter((t) => t.isFullySetup).length
  const withLeadAdmin = tenantsWithStatus.filter((t) => t.setupStatus.hasLeadAdmin).length
  const withAccessCode = tenantsWithStatus.filter((t) => t.setupStatus.hasAccessCode).length
  const withSlack = tenantsWithStatus.filter((t) => t.setupStatus.hasSlack).length

  const funnelMetrics = {
    totalTenants,
    fullySetup,
    fullySetupPercentage: totalTenants > 0 ? (fullySetup / totalTenants) * 100 : 0,
    withLeadAdmin,
    withLeadAdminPercentage: totalTenants > 0 ? (withLeadAdmin / totalTenants) * 100 : 0,
    withAccessCode,
    withAccessCodePercentage: totalTenants > 0 ? (withAccessCode / totalTenants) * 100 : 0,
    withSlack,
    withSlackPercentage: totalTenants > 0 ? (withSlack / totalTenants) * 100 : 0,
  }

  // Calculate drop-off points
  const dropOffPoints = {
    afterSignup: totalTenants - withLeadAdmin,
    afterLeadAdmin: withLeadAdmin - withAccessCode,
    afterAccessCode: withAccessCode - withSlack,
  }

  console.log("[v0] Returning onboarding analytics data")

  return NextResponse.json({
    tenants: tenantsWithStatus,
    funnelMetrics,
    dropOffPoints,
  })
})
