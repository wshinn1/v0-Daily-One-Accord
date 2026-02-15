import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function PATCH(request: NextRequest, { params }: { params: { columnId: string } }) {
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
    const { name, color, position } = body

    const updates: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (color !== undefined) updates.color = color
    if (position !== undefined) updates.position = position

    const { data: column, error } = await supabase
      .from("kanban_columns")
      .update(updates)
      .eq("id", params.columnId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ column })
  } catch (error) {
    console.error("[v0] Error updating column:", error)
    captureError(error, { context: "PATCH /api/kanban/columns/[columnId]" })
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { columnId: string } }) {
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

    const { error } = await supabase.from("kanban_columns").delete().eq("id", params.columnId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting column:", error)
    captureError(error, { context: "DELETE /api/kanban/columns/[columnId]" })
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 })
  }
}
