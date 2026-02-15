import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, UnauthorizedError } from "@/lib/errors/handler"

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

  // Fetch analytics data
  const { data: tenants } = await supabase
    .from("church_tenants")
    .select("id, created_at, subscription_status, subscription_plan, mrr")

  const { data: users } = await supabase.from("users").select("id, created_at, church_tenant_id")

  // Calculate growth metrics
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const newTenantsLast30Days = tenants?.filter((t) => new Date(t.created_at) >= thirtyDaysAgo).length || 0

  const newTenantsLast60Days = tenants?.filter((t) => new Date(t.created_at) >= sixtyDaysAgo).length || 0

  const newUsersLast30Days = users?.filter((u) => new Date(u.created_at) >= thirtyDaysAgo).length || 0

  // Monthly growth data for charts
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

    const tenantsInMonth =
      tenants?.filter((t) => {
        const createdDate = new Date(t.created_at)
        return createdDate >= monthStart && createdDate <= monthEnd
      }).length || 0

    const usersInMonth =
      users?.filter((u) => {
        const createdDate = new Date(u.created_at)
        return createdDate >= monthStart && createdDate <= monthEnd
      }).length || 0

    monthlyData.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      tenants: tenantsInMonth,
      users: usersInMonth,
    })
  }

  // Revenue by plan
  const revenueByPlan = {
    starter:
      tenants?.filter((t) => t.subscription_plan === "starter").reduce((sum, t) => sum + (Number(t.mrr) || 0), 0) || 0,
    growth:
      tenants?.filter((t) => t.subscription_plan === "growth").reduce((sum, t) => sum + (Number(t.mrr) || 0), 0) || 0,
    enterprise:
      tenants?.filter((t) => t.subscription_plan === "enterprise").reduce((sum, t) => sum + (Number(t.mrr) || 0), 0) ||
      0,
  }

  return NextResponse.json({
    totalTenants: tenants?.length || 0,
    totalUsers: users?.length || 0,
    newTenantsLast30Days,
    newUsersLast30Days,
    growthRate: newTenantsLast60Days > 0 ? ((newTenantsLast30Days / newTenantsLast60Days) * 100).toFixed(2) : "0",
    monthlyData,
    revenueByPlan,
  })
})
