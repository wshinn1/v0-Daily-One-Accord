import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { memberIds } = body

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: "Invalid member IDs" }, { status: 400 })
    }

    const assignments = memberIds.map((memberId) => ({
      group_id: groupId,
      member_id: memberId,
      joined_date: new Date().toISOString().split("T")[0],
    }))

    const { error } = await supabase.from("member_group_assignments").insert(assignments)

    if (error) {
      captureError(error, { context: "Add members to group" })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { context: "POST /api/members/groups/[groupId]/members" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
