import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { sendKanbanSlackNotification } from "@/lib/slack/kanban-notifications"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventType, cardId, boardId, previousColumnId, newColumnId, assignedToId } = body

    console.log("[v0] Kanban notification request:", { eventType, cardId, boardId })

    // Get user's church tenant
    const { data: userData } = await supabase
      .from("users")
      .select("church_tenant_id, full_name")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get card details
    const { data: card } = await supabase
      .from("kanban_cards")
      .select(
        `
        *,
        column:kanban_columns!kanban_cards_column_id_fkey(
          id,
          name,
          board:kanban_boards(id, name)
        ),
        assigned_to:users!kanban_cards_assigned_to_fkey(id, full_name)
      `,
      )
      .eq("id", cardId)
      .single()

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 })
    }

    // Get previous column name if card was moved
    let previousColumnName
    if (previousColumnId) {
      const { data: prevColumn } = await supabase
        .from("kanban_columns")
        .select("name")
        .eq("id", previousColumnId)
        .single()
      previousColumnName = prevColumn?.name
    }

    // Get assigned user details if card was assigned
    let assignedToName
    if (assignedToId) {
      const { data: assignedUser } = await supabase.from("users").select("full_name").eq("id", assignedToId).single()
      assignedToName = assignedUser?.full_name
    }

    // Send Slack notification
    await sendKanbanSlackNotification({
      churchTenantId: userData.church_tenant_id,
      eventType,
      cardTitle: card.title,
      cardDescription: card.description,
      boardName: card.column.board.name,
      columnName: card.column.name,
      previousColumnName,
      assignedToName: assignedToName || card.assigned_to?.full_name,
      assignedByName: userData.full_name,
      actorName: userData.full_name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in kanban notify route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
