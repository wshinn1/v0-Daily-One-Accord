import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    const supabase = await createServerClient()

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("card_id", cardId)
      .order("reminder_time", { ascending: true })

    if (error) throw error

    return NextResponse.json(reminders)
  } catch (error: any) {
    console.error("[v0] Error fetching reminders:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  try {
    const { cardId } = await params
    const supabase = await createServerClient()
    const body = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's church tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "Church tenant not found" }, { status: 404 })
    }

    // Get card to find assigned user
    const { data: card } = await supabase.from("kanban_cards").select("assigned_to").eq("id", cardId).single()

    const { data: reminder, error } = await supabase
      .from("reminders")
      .insert({
        card_id: cardId,
        church_tenant_id: userData.church_tenant_id,
        user_id: card?.assigned_to || user.id,
        reminder_time: body.reminder_time,
        notification_channels: body.notification_channels,
        message: body.message,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(reminder)
  } catch (error: any) {
    console.error("[v0] Error creating reminder:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
