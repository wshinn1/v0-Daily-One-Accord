import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"
import { TenantsManagementView } from "@/components/super-admin/tenants-management-view"

export default async function SuperAdminTenantsPage() {
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

  const { data: tenants } = await supabase
    .from("church_tenants")
    .select(`
      *,
      lead_admin:users!church_tenants_lead_admin_id_fkey(id, full_name, email)
    `)
    .order("created_at", { ascending: false })

  return (
    <SuperAdminLayout user={userData}>
      <TenantsManagementView tenants={tenants || []} />
    </SuperAdminLayout>
  )
}
