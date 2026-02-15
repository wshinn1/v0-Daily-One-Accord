import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

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

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    // Only admins can apply templates
    if (userData.role !== "lead_admin" && userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from("board_templates")
      .select("*")
      .eq("id", id)
      .single()

    if (templateError) throw templateError

    // Apply template data (this would involve creating statuses, labels, custom fields, etc.)
    // For now, we'll just return the template data for the client to handle
    return NextResponse.json({
      success: true,
      template_data: template.template_data,
    })
  } catch (error) {
    console.error("[v0] Error applying board template:", error)
    captureError(error, { endpoint: "/api/board-templates/[id]/apply", method: "POST" })
    return NextResponse.json({ error: "Failed to apply template" }, { status: 500 })
  }
}
