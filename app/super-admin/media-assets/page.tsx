import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"
import { SuperAdminMediaAssetsView } from "@/components/super-admin/super-admin-media-assets-view"

export default async function SuperAdminMediaAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const supabase = await getSupabaseServerClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (!userData) {
    redirect("/setup-profile")
  }

  if (!userData.is_super_admin) {
    redirect("/dashboard")
  }

  // Fetch all tenants for selection
  const { data: tenants } = await supabase.from("church_tenants").select("id, name, google_drive_url").order("name")

  const selectedTenantId = params.tenant
  const selectedTenant = tenants?.find((t) => t.id === selectedTenantId)

  return (
    <SuperAdminLayout user={userData}>
      <SuperAdminMediaAssetsView tenants={tenants || []} selectedTenant={selectedTenant} />
    </SuperAdminLayout>
  )
}
