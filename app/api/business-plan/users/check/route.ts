import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all business plan users
    const { data: users, error } = await supabase
      .from("business_plan_users")
      .select("id, email, full_name, created_at, last_login_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Business plan users in database:", users?.length || 0)

    return NextResponse.json({
      count: users?.length || 0,
      users: users || [],
    })
  } catch (error) {
    console.error("[v0] Check users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
