import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { captureError } from "@/lib/errors/sentry"

// POST - Bulk update visibility settings (lead admin only)
export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

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

    if (userData.role !== "lead_admin") {
      return NextResponse.json({ error: "Only lead admins can update visibility settings" }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body // Array of { menuItemKey, role, isVisible }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Settings must be an array" }, { status: 400 })
    }

    // Prepare bulk upsert data
    const upsertData = settings.map((setting) => ({
      church_tenant_id: userData.church_tenant_id,
      menu_item_key: setting.menuItemKey,
      role: setting.role,
      is_visible: setting.isVisible,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from("menu_visibility_settings")
      .upsert(upsertData, {
        onConflict: "church_tenant_id,menu_item_key,role",
      })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, count: data.length })
  } catch (error) {
    console.error("[v0] Error bulk updating menu visibility:", error)
    captureError(error as Error, {
      context: "menu_visibility_bulk_post",
    })
    return NextResponse.json({ error: "Failed to bulk update menu visibility" }, { status: 500 })
  }
}
