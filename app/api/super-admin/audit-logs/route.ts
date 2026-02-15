import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"

export const GET = asyncHandler(async (req: NextRequest) => {
  const supabase = await createClient()

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

  // Get query params
  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get("action")
  const userId = searchParams.get("userId")
  const tenantId = searchParams.get("tenantId")
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  // Build query
  let query = supabase
    .from("audit_logs")
    .select(
      `
      *,
      users(email, full_name),
      church_tenants(name)
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (action) {
    query = query.eq("action", action)
  }
  if (userId) {
    query = query.eq("user_id", userId)
  }
  if (tenantId) {
    query = query.eq("church_tenant_id", tenantId)
  }

  const { data: logs, error, count } = await query

  if (error) throw error

  return NextResponse.json({ logs, total: count })
})
