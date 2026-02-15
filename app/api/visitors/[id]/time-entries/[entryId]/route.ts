import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const { entryId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { started_at, ended_at, description, activity_type } = body

    let duration_minutes = null
    if (started_at && ended_at) {
      const start = new Date(started_at)
      const end = new Date(ended_at)
      duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000)
    }

    const { data: timeEntry, error } = await supabase
      .from("visitor_time_entries")
      .update({
        started_at,
        ended_at,
        duration_minutes,
        description,
        activity_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .select(
        `
        *,
        user:users(id, full_name)
      `,
      )
      .single()

    if (error) throw error

    return NextResponse.json({ timeEntry })
  } catch (error: any) {
    console.error("[v0] Error updating time entry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  try {
    const { entryId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("visitor_time_entries").delete().eq("id", entryId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting time entry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
