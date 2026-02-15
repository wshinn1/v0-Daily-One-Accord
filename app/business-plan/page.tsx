import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"
import { Button } from "@/components/ui/button"
import { BusinessPlanContent } from "@/components/business-plan/business-plan-content"

export default async function BusinessPlanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Business plan page - User authenticated:", !!user)
  console.log("[v0] User ID:", user?.id)
  console.log("[v0] User email:", user?.email)

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/business-plan/login")
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("has_business_plan_access, created_at, email, full_name")
    .eq("id", user.id)
    .single()

  console.log("[v0] User data query result:", userData)
  console.log("[v0] User data query error:", userError)
  console.log("[v0] has_business_plan_access:", userData?.has_business_plan_access)

  if (!userData?.has_business_plan_access) {
    console.log("[v0] User does not have business plan access, redirecting to login")
    console.log("[v0] User record:", JSON.stringify(userData, null, 2))
    redirect("/business-plan/login")
  }

  const { data: ndaSignature } = await supabase
    .from("nda_signatures")
    .select("id, signed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  // Grandfather clause: users created before NDA system don't need to sign
  const ndaSystemImplementedDate = new Date("2025-01-22")
  const userCreatedDate = new Date(userData.created_at)
  const requiresNDA = userCreatedDate >= ndaSystemImplementedDate

  console.log("[v0] Requires NDA:", requiresNDA)
  console.log("[v0] Has NDA signature:", !!ndaSignature)

  if (requiresNDA && !ndaSignature) {
    console.log("[v0] NDA required but not signed, redirecting to NDA page")
    redirect("/business-plan/nda")
  }

  const adminClient = getSupabaseServiceRoleClient()
  await adminClient.from("business_plan_access_logs").insert({
    user_id: user.id,
    accessed_at: new Date().toISOString(),
  })

  console.log("[v0] All checks passed, rendering business plan")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <h1 className="text-base md:text-lg font-bold text-blue-600">Daily One Accord</h1>
              <p className="text-xs font-bold text-red-600">Business Plan - Confidential</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 shrink-0">
              <span className="truncate max-w-[150px] md:max-w-[200px]">{userData.email}</span>
              <span className="hidden sm:inline">•</span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" type="submit" size="sm" className="h-7 text-xs">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full px-6 md:px-8 lg:px-12 py-8 md:py-12">
          <BusinessPlanContent userEmail={userData.email} userFullName={userData.full_name || ""} />
        </div>
      </div>
    </div>
  )
}
