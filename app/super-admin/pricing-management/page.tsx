import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PricingManagementView } from "@/components/super-admin/pricing-management-view"

export default async function PricingManagementPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is super admin
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (profile?.role !== "super_admin") {
    redirect("/dashboard")
  }

  return <PricingManagementView />
}
