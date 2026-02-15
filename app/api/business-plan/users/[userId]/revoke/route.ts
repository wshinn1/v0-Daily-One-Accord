import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/audit-log"

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const supabase = await getSupabaseServerClient()

    // Verify super admin
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

    const { data: targetUser } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", params.userId)
      .single()

    // Revoke access
    const { error } = await supabase.from("users").update({ has_business_plan_access: false }).eq("id", params.userId)

    if (error) {
      throw error
    }

    await createAuditLog({
      action: "user.updated",
      resourceType: "business_plan_access",
      resourceId: params.userId,
      details: {
        action: "revoke",
        targetEmail: targetUser?.email,
        targetName: targetUser?.full_name,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error revoking access:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
