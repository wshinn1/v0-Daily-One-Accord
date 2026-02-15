import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { captureError } from "@/lib/errors/sentry"

// GET - Fetch visibility settings for current user's tenant
export async function GET() {
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

    // Get all menu items
    const { data: menuItems, error: menuError } = await supabase.from("menu_items").select("*").order("display_order")

    if (menuError) throw menuError

    // Get visibility settings for this tenant
    const { data: visibilitySettings, error: visibilityError } = await supabase
      .from("menu_visibility_settings")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)

    if (visibilityError) throw visibilityError

    return NextResponse.json({
      menuItems,
      visibilitySettings,
      userRole: userData.role,
    })
  } catch (error) {
    console.error("[v0] Error fetching menu visibility:", error)
    captureError(error as Error, {
      context: "menu_visibility_get",
    })
    return NextResponse.json({ error: "Failed to fetch menu visibility" }, { status: 500 })
  }
}

// POST - Update visibility settings (lead admin only)
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
    const { menuItemKey, role, isVisible } = body

    // Upsert visibility setting
    const { data, error } = await supabase
      .from("menu_visibility_settings")
      .upsert(
        {
          church_tenant_id: userData.church_tenant_id,
          menu_item_key: menuItemKey,
          role,
          is_visible: isVisible,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "church_tenant_id,menu_item_key,role",
        },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error updating menu visibility:", error)
    captureError(error as Error, {
      context: "menu_visibility_post",
    })
    return NextResponse.json({ error: "Failed to update menu visibility" }, { status: 500 })
  }
}
