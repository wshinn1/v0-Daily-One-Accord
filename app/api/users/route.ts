import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

// GET /api/users - Get all users for the current church tenant
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching users for church tenant")
    const supabase = await getSupabaseServerClient()

    // Get current user to determine church tenant
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's church tenant
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("church_tenant_id")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.church_tenant_id) {
      console.error("[v0] Error fetching user church tenant:", userError)
      captureError(userError || new Error("No church tenant found"))
      return NextResponse.json({ error: "Church tenant not found" }, { status: 404 })
    }

    // Get all users for this church tenant
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("full_name", { ascending: true })

    if (usersError) {
      console.error("[v0] Error fetching users:", usersError)
      captureError(usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    console.log("[v0] Users fetched successfully:", users?.length || 0)
    return NextResponse.json(users || [])
  } catch (error: any) {
    console.error("[v0] Unexpected error fetching users:", error)
    captureError(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
