import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TeamsView } from "@/components/teams/teams-view"

export default async function TeamsPage({
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

  const { data: ministryTeams } = await supabase
    .from("ministry_teams")
    .select("*, leader:users(id, full_name), ministry_team_members(id, user:users(id, full_name), role)")
    .eq("church_tenant_id", tenantId)
    .order("created_at", { ascending: false })

  const { data: volunteerTeams } = await supabase
    .from("volunteer_teams")
    .select("*, coordinator:users(id, full_name), volunteer_team_members(id, user:users(id, full_name))")
    .eq("church_tenant_id", tenantId)
    .order("created_at", { ascending: false })

  const { data: members } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("church_tenant_id", tenantId)
    .order("full_name", { ascending: true })

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
      <TeamsView
        ministryTeams={ministryTeams || []}
        volunteerTeams={volunteerTeams || []}
        members={members || []}
        churchTenantId={tenantId}
      />
    </DashboardLayout>
  )
}
