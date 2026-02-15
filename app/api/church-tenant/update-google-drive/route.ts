import { requireAuth, canAccessTenant } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ValidationError, AuthorizationError, DatabaseError } from "@/lib/errors/handler"

export async function POST(request: Request) {
  try {
    const user = await requireAuth({
      requireRoles: ["lead_admin", "admin_staff"],
      requireChurchTenant: true,
    })

    const supabase = await getSupabaseServerClient()
    const { churchTenantId, googleDriveUrl, apiKey } = await request.json()

    console.log("[v0] Update Google Drive - Received data:", {
      churchTenantId,
      hasUrl: !!googleDriveUrl,
      hasApiKey: !!apiKey,
    })

    if (!churchTenantId) {
      throw new ValidationError("Church tenant ID is required")
    }

    if (!canAccessTenant(user, churchTenantId)) {
      console.log("[v0] Update Google Drive - Insufficient permissions", {
        userRole: user.role,
        isSuperAdmin: user.is_super_admin,
        userChurchId: user.church_tenant_id,
        targetChurchId: churchTenantId,
      })
      throw new AuthorizationError("Insufficient permissions to update Google Drive settings")
    }

    const updateData: any = {}
    if (googleDriveUrl !== undefined) {
      updateData.google_drive_url = googleDriveUrl
    }
    if (apiKey !== undefined) {
      updateData.google_drive_api_key = apiKey
    }

    console.log("[v0] Update Google Drive - Updating with:", updateData)

    // Update the Google Drive settings
    const { error } = await supabase.from("church_tenants").update(updateData).eq("id", churchTenantId)

    if (error) {
      throw new DatabaseError("Failed to update Google Drive settings", { originalError: error })
    }

    console.log("[v0] Update Google Drive - Success!")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update Google Drive - Unexpected error:", error)

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "User not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
