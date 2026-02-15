import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BusinessPlanViewersManagement } from "@/components/super-admin/business-plan-viewers-management"

export default async function BusinessPlanViewersPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_super_admin, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  const { data: viewers } = await supabase
    .from("business_plan_users")
    .select("*")
    .order("created_at", { ascending: false })

  return <BusinessPlanViewersManagement viewers={viewers || []} userName={userData.full_name || "Super Admin"} />
}
