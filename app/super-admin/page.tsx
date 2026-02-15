import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard"

export default async function SuperAdminPage() {
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

  if (!userData) {
    redirect("/setup-profile")
  }

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  const { data: tenants } = await supabase.from("church_tenants").select("*").order("created_at", { ascending: false })

  const tenantsWithLeadAdmin = await Promise.all(
    (tenants || []).map(async (tenant) => {
      if (tenant.lead_admin_id) {
        const { data: leadAdmin } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", tenant.lead_admin_id)
          .maybeSingle()

        return {
          ...tenant,
          lead_admin_name: leadAdmin?.full_name || leadAdmin?.email || null,
        }
      }
      return {
        ...tenant,
        lead_admin_name: null,
      }
    }),
  )

  const { data: superAdmins } = await supabase
    .from("users")
    .select("id, email, full_name, created_at")
    .eq("is_super_admin", true)
    .order("created_at", { ascending: false })

  return (
    <SuperAdminDashboard
      tenants={tenantsWithLeadAdmin || []}
      superAdmins={superAdmins || []}
      userName={userData.full_name || "Super Admin"}
    />
  )
}
