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

    // Get public templates and user's own templates
    const { data: templates, error } = await supabase
      .from("board_templates")
      .select("*")
      .or(`is_public.eq.true,church_tenant_id.eq.${userData.church_tenant_id}`)
      .order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error("[v0] Error fetching board templates:", error)
    captureError(error, { endpoint: "/api/board-templates", method: "GET" })
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
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
    const { name, description, template_data, is_public } = body

    const { data: template, error } = await supabase
      .from("board_templates")
      .insert({
        name,
        description,
        template_data,
        is_public: is_public || false,
        created_by: user.id,
        church_tenant_id: userData.church_tenant_id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ template })
  } catch (error) {
    console.error("[v0] Error creating board template:", error)
    captureError(error, { endpoint: "/api/board-templates", method: "POST" })
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
