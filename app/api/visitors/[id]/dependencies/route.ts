import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: dependencies, error } = await supabase
      .from("visitor_dependencies")
      .select("*, target_visitor:visitors(id, full_name, status)")
      .eq("source_visitor_id", id)

    if (error) throw error

    return NextResponse.json({ dependencies: dependencies || [] })
  } catch (error) {
    console.error("[v0] Error fetching dependencies:", error)
    captureError(error, { endpoint: "/api/visitors/[id]/dependencies", method: "GET" })
    return NextResponse.json({ error: "Failed to fetch dependencies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { target_visitor_id, dependency_type, notes } = body

    // Prevent self-dependencies
    if (id === target_visitor_id) {
      return NextResponse.json({ error: "Cannot create dependency to self" }, { status: 400 })
    }

    const { data: dependency, error } = await supabase
      .from("visitor_dependencies")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        source_visitor_id: id,
        target_visitor_id,
        dependency_type,
        notes,
        created_by: user.id,
      })
      .select("*, target_visitor:visitors(id, full_name, status)")
      .single()

    if (error) throw error

    return NextResponse.json({ dependency })
  } catch (error) {
    console.error("[v0] Error creating dependency:", error)
    captureError(error, { endpoint: "/api/visitors/[id]/dependencies", method: "POST" })
    return NextResponse.json({ error: "Failed to create dependency" }, { status: 500 })
  }
}
