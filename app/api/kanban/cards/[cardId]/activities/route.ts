import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/kanban/cards/[cardId]/activities - Get activity log for a card
export async function GET(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    console.log("[v0] Fetching activities for card:", params.cardId)
    const supabase = getSupabaseServerClient()

    const { data: activities, error } = await supabase
      .from("kanban_card_activities")
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .eq("card_id", params.cardId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching activities:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Activities fetched successfully:", activities?.length || 0)
    return NextResponse.json(activities || [])
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching activities:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/kanban/cards/[cardId]/activities - Create activity log entry
export async function POST(request: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    console.log("[v0] Creating activity for card:", params.cardId)
    const supabase = getSupabaseServerClient()
    const body = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: activity, error } = await supabase
      .from("kanban_card_activities")
      .insert({
        card_id: params.cardId,
        user_id: user.id,
        activity_type: body.activity_type,
        activity_data: body.activity_data || {},
      })
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Activity created successfully:", activity.id)
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("[v0] Unexpected error creating activity:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
