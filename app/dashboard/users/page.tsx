import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagement } from "@/components/users/user-management"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).maybeSingle()

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

  const { data: members } = await supabase
    .from("church_members")
    .select(
      `
      *,
      users!church_members_user_id_fkey(id, email, full_name)
    `,
    )
    .eq("church_tenant_id", tenantId)
    .order("created_at", { ascending: false })

  let invitations: any[] = []
  try {
    console.log("[v0] Fetching invitations for tenant:", tenantId)
    console.log("[v0] Current user is super admin:", userData.is_super_admin)

    const { data: allInvitations, error: allError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .order("created_at", { ascending: false })

    console.log("[v0] ALL invitations for tenant (no filters):", {
      data: allInvitations,
      error: allError,
      count: allInvitations?.length,
    })

    const { data, error } = await supabase
      .from("user_invitations")
      .select(
        `
        *,
        invited_by_user:users!user_invitations_invited_by_fkey(full_name)
      `,
      )
      .eq("church_tenant_id", tenantId)
      .or("status.is.null,status.eq.pending")
      .is("accepted_at", null)
      .order("created_at", { ascending: false })

    console.log("[v0] Invitations query result (with filters):", { data, error, count: data?.length })

    if (error) {
      console.error("[v0] Error querying invitations with status:", error)
      // If status column doesn't exist, query without it
      const fallbackResult = await supabase
        .from("user_invitations")
        .select(
          `
          *,
          invited_by_user:users!user_invitations_invited_by_fkey(full_name)
        `,
        )
        .eq("church_tenant_id", tenantId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false })

      console.log("[v0] Fallback query result:", {
        data: fallbackResult.data,
        error: fallbackResult.error,
        count: fallbackResult.data?.length,
      })
      invitations = fallbackResult.data || []
    } else {
      invitations = data || []
    }

    console.log("[v0] Invitations before member filter:", invitations.length)

    if (members && members.length > 0) {
      const memberEmails = new Set(members.map((m: any) => m.users?.email).filter(Boolean))
      console.log("[v0] Member emails:", Array.from(memberEmails))
      invitations = invitations.filter((inv: any) => !memberEmails.has(inv.email))
      console.log("[v0] Invitations after member filter:", invitations.length)
    }
  } catch (err) {
    console.error("[v0] Error loading invitations:", err)
    invitations = []
  }

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
      <UserManagement
        currentUser={{ ...userData, church_tenants: tenantData }}
        tenantId={tenantId}
        members={members || []}
        invitations={invitations || []}
      />
    </DashboardLayout>
  )
}
