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

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    const { data: templates, error } = await supabase
      .from("visitor_recurring_templates")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error("[v0] Error fetching recurring templates:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
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
    const {
      name,
      description,
      recurrence_type,
      recurrence_interval,
      recurrence_day_of_week,
      recurrence_day_of_month,
      card_template,
      is_active,
    } = body

    // Calculate next generation time
    const next_generation_at = calculateNextGeneration(
      recurrence_type,
      recurrence_interval,
      recurrence_day_of_week,
      recurrence_day_of_month,
    )

    const { data: template, error } = await supabase
      .from("visitor_recurring_templates")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        description,
        recurrence_type,
        recurrence_interval,
        recurrence_day_of_week,
        recurrence_day_of_month,
        card_template,
        is_active: is_active ?? true,
        next_generation_at,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ template })
  } catch (error: any) {
    console.error("[v0] Error creating recurring template:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function calculateNextGeneration(type: string, interval: number, dayOfWeek?: number, dayOfMonth?: number): string {
  const now = new Date()

  switch (type) {
    case "daily":
      now.setDate(now.getDate() + interval)
      break
    case "weekly":
      const daysUntilTarget = ((dayOfWeek || 0) - now.getDay() + 7) % 7
      now.setDate(now.getDate() + (daysUntilTarget || 7 * interval))
      break
    case "monthly":
      now.setMonth(now.getMonth() + interval)
      if (dayOfMonth) {
        now.setDate(dayOfMonth)
      }
      break
  }

  return now.toISOString()
}
