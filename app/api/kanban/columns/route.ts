import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!["lead_admin", "admin"].includes(userData?.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { board_id, name, color, position } = body

    const { data: column, error } = await supabase
      .from("kanban_columns")
      .insert({
        board_id,
        name,
        color: color || "gray",
        position,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ column })
  } catch (error) {
    console.error("[v0] Error creating column:", error)
    captureError(error, { context: "POST /api/kanban/columns" })
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 })
  }
}
