import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    // Get all visitors with assignments
    const { data: visitors, error: visitorsError } = await supabase
      .from("visitors")
      .select("*, assigned_to:users(id, full_name)")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (visitorsError) throw visitorsError

    // Get all team members
    const { data: teamMembers, error: teamError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (teamError) throw teamError

    // Calculate team performance metrics
    const teamPerformance =
      teamMembers?.map((member) => {
        const assignedVisitors = visitors?.filter((v) => v.assigned_to?.id === member.id) || []
        const completedVisitors = assignedVisitors.filter((v) => v.status === "engaged")
        const completionRate =
          assignedVisitors.length > 0 ? ((completedVisitors.length / assignedVisitors.length) * 100).toFixed(1) : "0"

        return {
          memberId: member.id,
          memberName: member.full_name,
          assignedCount: assignedVisitors.length,
          completedCount: completedVisitors.length,
          completionRate: Number.parseFloat(completionRate),
        }
      }) || []

    // Unassigned visitors count
    const unassignedCount = visitors?.filter((v) => !v.assigned_to).length || 0

    return NextResponse.json({
      teamPerformance,
      unassignedCount,
      totalTeamMembers: teamMembers?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error fetching team analytics:", error)
    captureError(error, { endpoint: "/api/analytics/team", method: "GET" })
    return NextResponse.json({ error: "Failed to fetch team analytics" }, { status: 500 })
  }
}
