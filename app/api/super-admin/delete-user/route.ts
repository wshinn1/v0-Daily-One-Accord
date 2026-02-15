import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is super admin
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify super admin status
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_super_admin")
      .eq("id", user.id)
      .single()

    if (userError || !userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden: Super admin access required" }, { status: 403 })
    }

    // Get user ID to delete from request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const adminClient = await getSupabaseServiceRoleClient()

    console.log("[v0] Deleting user:", userId)

    const { error: dbDeleteError } = await adminClient.from("users").delete().eq("id", userId)

    if (dbDeleteError) {
      console.error("[v0] Error deleting user from database:", dbDeleteError)
      return NextResponse.json(
        { error: `Failed to delete user from database: ${dbDeleteError.message}` },
        { status: 500 },
      )
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("[v0] Error deleting user from auth:", deleteError)
      return NextResponse.json({ error: `Failed to delete user from auth: ${deleteError.message}` }, { status: 500 })
    }

    console.log("[v0] User deleted successfully from both database and Supabase Auth")

    return NextResponse.json({
      success: true,
      message: "User completely removed from system",
    })
  } catch (error) {
    console.error("[v0] Error in delete user route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
