import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const { data: filters, error } = await supabase
      .from("saved_filters")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json({ filters: filters || [] })
  } catch (error) {
    console.error("[v0] Error fetching saved filters:", error)
    captureError(error, { endpoint: "/api/saved-filters", method: "GET" })
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
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

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const body = await request.json()
    const { name, filter_config, is_default } = body

    const { data: filter, error } = await supabase
      .from("saved_filters")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        user_id: user.id,
        name,
        filter_config,
        is_default: is_default || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ filter })
  } catch (error) {
    console.error("[v0] Error creating saved filter:", error)
    captureError(error, { endpoint: "/api/saved-filters", method: "POST" })
    return NextResponse.json({ error: "Failed to create filter" }, { status: 500 })
  }
}
