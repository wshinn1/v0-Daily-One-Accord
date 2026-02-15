import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AttendanceView } from "@/components/attendance/attendance-view"

export default async function AttendancePage({
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

  const { data: events } = await supabase
    .from("events")
    .select("id, title, start_time")
    .eq("church_tenant_id", tenantId)
    .order("start_time", { ascending: false })
    .limit(50)

  const { data: members } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("church_tenant_id", tenantId)
    .order("full_name", { ascending: true })

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*, event:events(title, start_time), user:users(full_name)")
    .eq("church_tenant_id", tenantId)
    .order("attended_at", { ascending: false })

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
      <AttendanceView
        events={events || []}
        members={members || []}
        attendance={attendance || []}
        churchTenantId={tenantId}
      />
    </DashboardLayout>
  )
}
