import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RundownManager } from "@/components/rundowns/rundown-manager"

export default async function RundownsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

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

  const tenantId = params.tenant || userData.church_tenant_id

  if (userData.is_super_admin && !tenantId) {
    redirect("/super-admin")
  }

  if (!tenantId) {
    redirect("/setup-profile")
  }

  const { data: tenantData } = await supabase.from("church_tenants").select("*").eq("id", tenantId).single()

  const { data: activeRundowns } = await supabase
    .from("event_rundowns")
    .select("*, created_by_user:created_by(full_name)")
    .eq("church_tenant_id", tenantId)
    .eq("is_archived", false)
    .order("event_date", { ascending: false })

  const { data: archivedRundowns } = await supabase
    .from("event_rundowns")
    .select("*, created_by_user:created_by(full_name)")
    .eq("church_tenant_id", tenantId)
    .eq("is_archived", true)
    .order("event_date", { ascending: false })

  const { data: members } = await supabase
    .from("church_members")
    .select("user_id, users(id, full_name, email)")
    .eq("church_tenant_id", tenantId)

  const churchMembers = members?.map((m: any) => m.users).filter(Boolean) || []

  const tenantTheme = {
    logo_url: tenantData?.logo_url,
    primary_color: tenantData?.primary_color,
    secondary_color: tenantData?.secondary_color,
    accent_color: tenantData?.accent_color,
    background_color: tenantData?.background_color,
    text_color: tenantData?.text_color,
    heading_font: tenantData?.heading_font,
    body_font: tenantData?.body_font,
    font_size_base: tenantData?.font_size_base,
    font_size_heading: tenantData?.font_size_heading,
  }

  return (
    <DashboardLayout
      user={{ ...userData, church_tenants: tenantData }}
      tenantId={params.tenant}
      tenantTheme={tenantTheme}
    >
      <RundownManager
        rundowns={activeRundowns || []}
        archivedRundowns={archivedRundowns || []}
        churchMembers={churchMembers}
        churchTenantId={tenantId}
        defaultSlackChannel={tenantData?.rundown_channel_name}
      />
    </DashboardLayout>
  )
}
