import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: board, error } = await supabase
      .from("kanban_boards")
      .select(`
        *,
        kanban_columns (
          *,
          kanban_cards (*)
        )
      `)
      .eq("id", params.boardId)
      .single()

    if (error) throw error

    return NextResponse.json({ board })
  } catch (error) {
    console.error("[v0] Error fetching board:", error)
    captureError(error, { context: "GET /api/kanban/boards/[boardId]" })
    return NextResponse.json({ error: "Failed to fetch board" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { boardId: string } }) {
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
    const { name, description } = body

    const { data: board, error } = await supabase
      .from("kanban_boards")
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq("id", params.boardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ board })
  } catch (error) {
    console.error("[v0] Error updating board:", error)
    captureError(error, { context: "PATCH /api/kanban/boards/[boardId]" })
    return NextResponse.json({ error: "Failed to update board" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { boardId: string } }) {
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

    const { error } = await supabase.from("kanban_boards").delete().eq("id", params.boardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting board:", error)
    captureError(error, { context: "DELETE /api/kanban/boards/[boardId]" })
    return NextResponse.json({ error: "Failed to delete board" }, { status: 500 })
  }
}
