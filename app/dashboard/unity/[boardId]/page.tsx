import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GenericKanban } from "@/components/kanban/generic-kanban"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default async function UnityBoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>
}) {
  try {
    console.log("[v0] Unity board page loading...")
    const { boardId } = await params
    console.log("[v0] Board ID:", boardId)

    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No user, redirecting to login")
      redirect("/login")
    }

    console.log("[v0] User authenticated:", user.id)

    const { data: userData } = await supabase
      .from("users")
      .select("church_tenant_id, full_name, role")
      .eq("id", user.id)
      .single()

    console.log("[v0] User data:", userData)

    if (!userData?.church_tenant_id) {
      console.log("[v0] No tenant ID, redirecting to dashboard")
      redirect("/dashboard")
    }

    // Fetch board with columns and cards
    console.log("[v0] Fetching board:", boardId, "for tenant:", userData.church_tenant_id)

    const { data: board, error } = await supabase
      .from("kanban_boards")
      .select(`
        *,
        kanban_columns (
          *,
          kanban_cards (*)
        )
      `)
      .eq("id", boardId)
      .eq("church_tenant_id", userData.church_tenant_id)
      .single()

    if (error) {
      console.error("[v0] Error fetching board:", error)
      redirect("/dashboard")
    }

    if (!board) {
      console.error("[v0] Board not found:", boardId)
      redirect("/dashboard")
    }

    console.log("[v0] Board fetched:", board.name)
    console.log("[v0] Board columns:", board.kanban_columns)

    // Ensure columns is always an array
    if (!board.kanban_columns) {
      console.log("[v0] Board has no columns, initializing empty array")
      board.kanban_columns = []
    } else if (!Array.isArray(board.kanban_columns)) {
      console.error("[v0] kanban_columns is not an array:", typeof board.kanban_columns)
      board.kanban_columns = []
    } else {
      console.log("[v0] Board has", board.kanban_columns.length, "columns")
      // Ensure each column has required properties and kanban_cards array
      board.kanban_columns = board.kanban_columns
        .map((col: any) => {
          if (!col) {
            console.error("[v0] Column is null/undefined, skipping")
            return null
          }
          return {
            id: col.id || "",
            name: col.name || "Untitled",
            color: col.color || "gray",
            position: col.position || 0,
            kanban_cards: Array.isArray(col.kanban_cards) ? col.kanban_cards : [],
          }
        })
        .filter(Boolean) // Remove any null columns
    }

    console.log("[v0] Processed columns:", board.kanban_columns.length)

    // Fetch staff members for assignment
    const { data: staffMembers } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("church_tenant_id", userData.church_tenant_id)

    console.log("[v0] Staff members:", staffMembers?.length || 0)

    // Fetch tenant data for theme
    const { data: tenantData } = await supabase
      .from("church_tenants")
      .select("*")
      .eq("id", userData.church_tenant_id)
      .single()

    console.log("[v0] Tenant data loaded")

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

    console.log("[v0] Rendering GenericKanban with board:", board.name)

    return (
      <DashboardLayout user={{ ...userData, church_tenants: tenantData }} tenantTheme={tenantTheme}>
        <GenericKanban
          board={board}
          staffMembers={staffMembers || []}
          churchTenantId={userData.church_tenant_id}
          currentUserId={user.id}
          currentUserRole={userData.role}
        />
      </DashboardLayout>
    )
  } catch (error) {
    console.error("[v0] Page error:", error)
    throw error
  }
}
