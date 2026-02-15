import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dependencyId: string }> },
) {
  try {
    const { dependencyId } = await params
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("visitor_dependencies").delete().eq("id", dependencyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting dependency:", error)
    captureError(error, { endpoint: "/api/visitors/[id]/dependencies/[dependencyId]", method: "DELETE" })
    return NextResponse.json({ error: "Failed to delete dependency" }, { status: 500 })
  }
}
