import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MenuVisibilityManager } from "@/components/settings/menu-visibility-manager"

export default async function MenuVisibilityPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    redirect("/setup-profile")
  }

  // Only lead admins can access this page
  if (userData.role !== "lead_admin") {
    redirect("/dashboard")
  }

  const tenantId = params.tenant || userData.church_tenant_id

  if (!tenantId) {
    redirect("/setup-profile")
  }

  const { data: tenantInfo } = await supabase.from("church_tenants").select("*").eq("id", tenantId).single()

  if (!tenantInfo) {
    redirect("/dashboard")
  }

  const displayUser = {
    ...userData,
    church_tenants: tenantInfo,
    church_tenant_id: tenantId,
  }

  const tenantTheme = {
    logo_url: tenantInfo?.logo_url,
    primary_color: tenantInfo?.primary_color,
    secondary_color: tenantInfo?.secondary_color,
    accent_color: tenantInfo?.accent_color,
    background_color: tenantInfo?.background_color,
    text_color: tenantInfo?.text_color,
    heading_font: tenantInfo?.heading_font,
    body_font: tenantInfo?.body_font,
    font_size_base: tenantInfo?.font_size_base,
    font_size_heading: tenantInfo?.font_size_heading,
  }

  return (
    <DashboardLayout user={displayUser} tenantId={params.tenant} tenantTheme={tenantTheme}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Visibility Settings</h2>
          <p className="text-muted-foreground">Control which menu items each role can see</p>
        </div>

        <MenuVisibilityManager tenantId={tenantId} />
      </div>
    </DashboardLayout>
  )
}
