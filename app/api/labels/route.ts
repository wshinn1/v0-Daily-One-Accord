import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: labels, error } = await supabase
      .from("visitor_labels")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching labels:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ labels })
  } catch (error) {
    console.error("[v0] Exception in GET /api/labels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!["lead_admin", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, color } = body

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    const { data: label, error } = await supabase
      .from("visitor_labels")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name: name.trim(),
        color,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating label:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ label }, { status: 201 })
  } catch (error) {
    console.error("[v0] Exception in POST /api/labels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
