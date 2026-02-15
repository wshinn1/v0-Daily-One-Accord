import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and tenant
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tenant
    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    // Fetch donors for this tenant
    const { data: donors, error } = await supabase
      .from("donors")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("total_given", { ascending: false })

    if (error) {
      console.error("Error fetching donors:", error)
      return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 })
    }

    return NextResponse.json({ donors })
  } catch (error) {
    console.error("Error in donors API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
