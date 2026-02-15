import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { MENU_REGISTRY } from "@/lib/menu-registry"
import { captureError } from "@/lib/errors/sentry"

export async function GET() {
  try {
    const supabase = await getSupabaseServiceRoleClient()

    console.log("[v0] Starting menu sync...")

    // Get all existing menu items
    const { data: existingItems, error: fetchError } = await supabase.from("menu_items").select("key")

    if (fetchError) {
      if (
        fetchError.message?.includes("Too Many") ||
        fetchError.message?.includes("rate limit") ||
        fetchError.message?.includes("Unexpected token")
      ) {
        console.log("[v0] Rate limit detected, skipping menu sync")
        return NextResponse.json({
          success: true,
          message: "Rate limit detected, skipping sync",
          synced: 0,
          rateLimited: true,
        })
      }

      // Only log non-rate-limit errors
      console.error("[v0] Error fetching existing menu items:", fetchError)
      throw new Error(`Failed to fetch menu items: ${fetchError.message}`)
    }

    const existingKeys = new Set(existingItems?.map((item) => item.key) || [])
    console.log("[v0] Existing menu items:", existingKeys.size)

    // Find new items that need to be added
    const newItems = MENU_REGISTRY.filter((item) => !existingKeys.has(item.key))

    if (newItems.length === 0) {
      console.log("[v0] No new menu items to sync")
      return NextResponse.json({
        success: true,
        message: "No new menu items to sync",
        synced: 0,
      })
    }

    console.log("[v0] New menu items to sync:", newItems.length)

    // Insert new menu items
    const { error: insertError } = await supabase.from("menu_items").insert(
      newItems.map((item) => ({
        key: item.key,
        name: item.label,
        description: item.description,
        category: item.category,
        icon: item.icon,
        href: item.href,
        group_name: item.type,
        display_order: 0,
        is_external: false,
      })),
    )

    if (insertError) {
      console.error("[v0] Error inserting new menu items:", insertError)
      throw new Error(`Failed to insert menu items: ${insertError.message} (code: ${insertError.code})`)
    }

    // Get all church tenants
    const { data: tenants, error: tenantsError } = await supabase.from("church_tenants").select("id")

    if (tenantsError) {
      console.error("[v0] Error fetching tenants:", tenantsError)
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`)
    }

    console.log("[v0] Creating default visibility settings for", tenants?.length, "tenants")

    // Create default visibility settings for each tenant and role
    const roles = ["lead_admin", "admin", "member", "volunteer"]
    const visibilitySettings = []

    for (const tenant of tenants || []) {
      for (const item of newItems) {
        for (const role of roles) {
          const isVisible = item.defaultRoles?.includes(role) ?? true

          visibilitySettings.push({
            church_tenant_id: tenant.id,
            menu_item_key: item.key,
            role: role,
            is_visible: isVisible,
          })
        }
      }
    }

    if (visibilitySettings.length > 0) {
      const { error: visibilityError } = await supabase.from("menu_visibility_settings").insert(visibilitySettings)

      if (visibilityError) {
        console.error("[v0] Error creating visibility settings:", visibilityError)
        throw new Error(`Failed to create visibility settings: ${visibilityError.message}`)
      }
    }

    console.log("[v0] Menu sync completed successfully")

    return NextResponse.json({
      success: true,
      message: `Synced ${newItems.length} new menu items`,
      synced: newItems.length,
      items: newItems.map((item) => item.key),
    })
  } catch (error) {
    console.error("[v0] Menu sync error:", error)
    captureError(error, { context: "menu-sync-trigger" })
    return NextResponse.json({ success: false, error: "Failed to sync menu items" }, { status: 500 })
  }
}
