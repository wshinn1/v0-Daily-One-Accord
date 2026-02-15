import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/audit-log"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userIds } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "User IDs array is required" }, { status: 400 })
    }

    if (userIds.length > 50) {
      return NextResponse.json({ error: "Maximum 50 users per bulk revoke" }, { status: 400 })
    }

    const { error } = await supabase.from("users").update({ has_business_plan_access: false }).in("id", userIds)

    if (error) {
      throw error
    }

    await createAuditLog({
      action: "user.updated",
      resourceType: "business_plan_access",
      details: {
        bulkRevoke: true,
        userIds,
        count: userIds.length,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({
      success: true,
      revokedCount: userIds.length,
    })
  } catch (error) {
    console.error("[v0] Bulk revoke error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
