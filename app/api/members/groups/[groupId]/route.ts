import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("member_groups").delete().eq("id", groupId)

    if (error) {
      captureError(error, { context: "Delete member group" })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { context: "DELETE /api/members/groups/[groupId]" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
