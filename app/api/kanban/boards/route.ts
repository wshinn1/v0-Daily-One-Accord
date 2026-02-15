import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/kanban/boards - Starting...")
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[v0] User:", user?.id)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()
    console.log("[v0] User data:", userData)

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    const { data: boards, error } = await supabase
      .from("kanban_boards")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("created_at", { ascending: true })

    console.log("[v0] Boards query result:", { boards, error })

    if (error) {
      // Check if it's a rate limit error
      if (error.message && error.message.includes("Too Many")) {
        console.error("[v0] Rate limit error, returning empty boards array")
        return NextResponse.json({ boards: [], rateLimited: true })
      }
      throw error
    }

    return NextResponse.json({ boards })
  } catch (error) {
    console.error("[v0] Error fetching boards:", error)
    captureError(error, { context: "GET /api/kanban/boards" })
    return NextResponse.json({ boards: [], error: "Failed to fetch boards" }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    if (!["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, board_type } = body

    const { data: board, error } = await supabase
      .from("kanban_boards")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        description,
        board_type: board_type || "custom",
      })
      .select()
      .single()

    if (error) throw error

    // Create default columns for new board
    const defaultColumns = [
      { name: "To Do", color: "gray", position: 0 },
      { name: "In Progress", color: "blue", position: 1 },
      { name: "Done", color: "green", position: 2 },
    ]

    const { error: columnsError } = await supabase.from("kanban_columns").insert(
      defaultColumns.map((col) => ({
        board_id: board.id,
        ...col,
      })),
    )

    if (columnsError) throw columnsError

    return NextResponse.json({ board })
  } catch (error) {
    console.error("[v0] Error creating board:", error)
    captureError(error, { context: "POST /api/kanban/boards" })
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 })
  }
}
