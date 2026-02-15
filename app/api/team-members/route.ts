import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    // Fetch all team members for autocomplete
    const { data: teamMembers, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("full_name")

    if (error) throw error

    return NextResponse.json({ teamMembers })
  } catch (error: any) {
    console.error("[v0] Error fetching team members:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
