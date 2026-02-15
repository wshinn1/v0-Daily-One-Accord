import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: users, error } = await supabase
      .from("business_plan_users")
      .select("id, email, full_name, password_hash, created_at, invitation_accepted, access_granted")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        users: [],
        count: 0,
      })
    }

    const safeUsers = users?.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      has_password: !!user.password_hash,
      password_hash_length: user.password_hash?.length || 0,
      created_at: user.created_at,
      invitation_accepted: user.invitation_accepted,
      access_granted: user.access_granted,
    }))

    return NextResponse.json({
      success: true,
      users: safeUsers || [],
      count: safeUsers?.length || 0,
      message:
        safeUsers?.length === 0 ? "No users found in business_plan_users table" : `Found ${safeUsers.length} user(s)`,
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        users: [],
        count: 0,
      },
      { status: 500 },
    )
  }
}
