import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, hasAccess } = await request.json()

    if (!userId || typeof hasAccess !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Use service role client to update the user
    const adminClient = getSupabaseServiceRoleClient()

    const { error: updateError } = await adminClient
      .from("users")
      .update({
        has_business_plan_access: hasAccess,
        business_plan_invited_at: hasAccess ? new Date().toISOString() : null,
        business_plan_invited_by: hasAccess ? user.id : null,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating business plan access:", updateError)
      return NextResponse.json({ error: "Failed to update access" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in business plan access API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
