import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    const { data: alerts, error } = await supabase
      .from("scheduled_alerts")
      .select("*")
      .eq("church_tenant_id", userData?.church_tenant_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(alerts)
  } catch (error: any) {
    console.error("[v0] Error fetching alerts:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    // Calculate next_run_at based on schedule
    let nextRunAt = body.next_run_at
    if (!nextRunAt) {
      const now = new Date()
      const [hours, minutes] = body.schedule_time.split(":")
      nextRunAt = new Date()
      nextRunAt.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      if (nextRunAt <= now) {
        nextRunAt.setDate(nextRunAt.getDate() + 1)
      }
    }

    const { data: alert, error } = await supabase
      .from("scheduled_alerts")
      .insert({
        church_tenant_id: userData?.church_tenant_id,
        name: body.name,
        message: body.message,
        channel_id: body.channel_id,
        schedule_type: body.schedule_type,
        schedule_time: body.schedule_time,
        schedule_day_of_week: body.schedule_day_of_week,
        schedule_day_of_month: body.schedule_day_of_month,
        next_run_at: nextRunAt,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(alert)
  } catch (error: any) {
    console.error("[v0] Error creating alert:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
