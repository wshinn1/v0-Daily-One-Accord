import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(`
        *,
        visitor:visitors(id, full_name),
        commenter:users!notifications_commenter_id_fkey(id, full_name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Error fetching notifications:", error)
      captureError(new Error(`Failed to fetch notifications: ${error.message}`), {
        endpoint: "/api/notifications",
        method: "GET",
        userId: user.id,
        error,
      })
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("[v0] Error in notifications API:", error)
    if (error instanceof Error) {
      captureError(error, { endpoint: "/api/notifications", method: "GET" })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId } = await request.json()

    // Mark notification as read
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error marking notification as read:", error)
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in notifications API:", error)
    if (error instanceof Error) {
      captureError(error, { endpoint: "/api/notifications", method: "PATCH" })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
