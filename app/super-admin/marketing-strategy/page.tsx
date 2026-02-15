import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"
import { MarketingStrategyContent } from "@/components/super-admin/marketing-strategy-content"

export default async function MarketingStrategyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin, full_name").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  return (
    <SuperAdminLayout user={userData}>
      <MarketingStrategyContent />
    </SuperAdminLayout>
  )
}
