import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    // Get members already in the group
    const { data: existingMembers } = await supabase
      .from("member_group_assignments")
      .select("member_id")
      .eq("group_id", groupId)

    const existingMemberIds = existingMembers?.map((m) => m.member_id) || []

    // Get all members not in the group
    let query = supabase
      .from("member_directory")
      .select("id, first_name, last_name, email")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("first_name")

    if (existingMemberIds.length > 0) {
      query = query.not("id", "in", `(${existingMemberIds.join(",")})`)
    }

    const { data: members, error } = await query

    if (error) {
      captureError(error, { context: "Fetch available members" })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    captureError(error, { context: "GET /api/members/groups/[groupId]/available-members" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
