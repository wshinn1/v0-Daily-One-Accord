import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SmsNotificationsView } from "@/components/sms/sms-notifications-view"

export default async function SmsNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  console.log("[v0] SMS Page - searchParams:", params)

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

  console.log("[v0] SMS Page - userData:", {
    id: userData.id,
    email: userData.email,
    is_super_admin: userData.is_super_admin,
    church_tenant_id: userData.church_tenant_id,
  })

  const tenantId = params.tenant || userData.church_tenant_id

  console.log("[v0] SMS Page - tenantId:", tenantId)

  if (!tenantId) {
    console.log("[v0] SMS Page - No tenantId, redirecting to dashboard")
    if (userData.is_super_admin) {
      redirect("/super-admin")
    }
    redirect("/dashboard")
  }

  const { data: tenantData } = await supabase.from("church_tenants").select("*").eq("id", tenantId).single()

  if (!tenantData) {
    console.log("[v0] SMS Page - No tenant data found, redirecting")
    redirect("/dashboard")
  }

  // Fetch scheduled SMS
  const { data: scheduledSms } = await supabase
    .from("scheduled_sms")
    .select("*, event:events(title), creator:created_by(full_name)")
    .eq("church_tenant_id", tenantId)
    .order("scheduled_for", { ascending: true })

  // Fetch bulk campaigns
  const { data: bulkCampaigns } = await supabase
    .from("bulk_sms_campaigns")
    .select("*, creator:created_by(full_name)")
    .eq("church_tenant_id", tenantId)
    .order("created_at", { ascending: false })

  // Fetch upcoming events for scheduling
  const { data: events } = await supabase
    .from("events")
    .select("id, title, start_time")
    .eq("church_tenant_id", tenantId)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  // Check if SMS is configured
  const smsConfigured = !!(tenantData?.sms_enabled && tenantData?.sms_phone_number)

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

  console.log("[v0] SMS Page - Rendering with tenantId:", tenantId)

  return (
    <DashboardLayout
      user={{ ...userData, church_tenants: tenantData }}
      tenantId={params.tenant}
      tenantTheme={tenantTheme}
    >
      <SmsNotificationsView
        churchTenantId={tenantId}
        scheduledSms={scheduledSms || []}
        bulkCampaigns={bulkCampaigns || []}
        events={events || []}
        smsConfigured={smsConfigured}
      />
    </DashboardLayout>
  )
}
