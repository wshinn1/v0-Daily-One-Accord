import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: timeEntries, error } = await supabase
      .from("visitor_time_entries")
      .select(
        `
        *,
        user:users(id, full_name)
      `,
      )
      .eq("visitor_id", id)
      .order("started_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ timeEntries })
  } catch (error: any) {
    console.error("[v0] Error fetching time entries:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
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
      .insert({
        visitor_id: id,
        user_id: user.id,
        church_tenant_id: userData.church_tenant_id,
        started_at,
        ended_at,
        duration_minutes,
        description,
        activity_type,
      })
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
    console.error("[v0] Error creating time entry:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
