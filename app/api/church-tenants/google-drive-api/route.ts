import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] Google Drive API: No user found")
      return NextResponse.json({ error: "Unauthorized - No user found" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Google Drive API: Request body:", JSON.stringify(body))

    const { churchTenantId, apiKey } = body

    if (!churchTenantId || !apiKey) {
      const errorMsg = `Missing required fields - churchTenantId: ${!!churchTenantId}, apiKey: ${!!apiKey}`
      console.error("[v0] Google Drive API:", errorMsg)
      return NextResponse.json(
        {
          error: errorMsg,
          received: { churchTenantId, apiKey: apiKey ? "[REDACTED]" : null },
        },
        { status: 400 },
      )
    }

    // Verify user has permission to update this tenant
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, church_tenant_id, is_super_admin")
      .eq("id", user.id)
      .single()

    if (userError) {
      console.error("[v0] Google Drive API: Error fetching user data:", userError)
      return NextResponse.json({ error: "Failed to verify permissions", details: userError.message }, { status: 500 })
    }

    console.log("[v0] Google Drive API: User data:", JSON.stringify(userData))

    const canUpdate =
      userData?.is_super_admin ||
      (userData?.church_tenant_id === churchTenantId &&
        (userData?.role === "lead_admin" || userData?.role === "admin_staff"))

    if (!canUpdate) {
      const errorMsg = `User not authorized - isSuperAdmin: ${userData?.is_super_admin}, userTenantId: ${userData?.church_tenant_id}, requestTenantId: ${churchTenantId}, userRole: ${userData?.role}`
      console.error("[v0] Google Drive API:", errorMsg)
      return NextResponse.json({ error: errorMsg }, { status: 403 })
    }

    // Update the API key
    console.log("[v0] Google Drive API: Attempting to update church_tenants table")
    const { error: updateError } = await supabase
      .from("church_tenants")
      .update({ google_drive_api_key: apiKey })
      .eq("id", churchTenantId)

    if (updateError) {
      console.error("[v0] Google Drive API: Database update error:", updateError)
      return NextResponse.json(
        {
          error: "Database update failed",
          details: updateError.message,
          code: updateError.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Google Drive API: Successfully saved API key for tenant:", churchTenantId)
    return NextResponse.json({ success: true, message: "API key saved successfully" })
  } catch (error: any) {
    console.error("[v0] Google Drive API: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Failed to save API key",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    status: "API route is working",
    timestamp: new Date().toISOString(),
  })
}
