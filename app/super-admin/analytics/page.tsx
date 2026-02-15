import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"
import { AnalyticsDashboardView } from "@/components/super-admin/analytics-dashboard-view"

export default async function SuperAdminAnalyticsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (!userData || !userData.is_super_admin) {
    redirect("/dashboard")
  }

  return (
    <SuperAdminLayout user={userData}>
      <AnalyticsDashboardView />
    </SuperAdminLayout>
  )
}
