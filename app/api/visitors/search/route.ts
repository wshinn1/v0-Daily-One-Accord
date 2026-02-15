import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assigned_to")
    const labelId = searchParams.get("label_id")
    const dueDateFrom = searchParams.get("due_date_from")
    const dueDateTo = searchParams.get("due_date_to")

    let queryBuilder = supabase
      .from("visitors")
      .select("*, assigned_to:users(id, full_name), labels:visitor_labels(label:labels(*))")
      .eq("church_tenant_id", userData.church_tenant_id)

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,notes.ilike.%${query}%`,
      )
    }

    // Status filter
    if (status) {
      queryBuilder = queryBuilder.eq("status", status)
    }

    // Assigned to filter
    if (assignedTo) {
      if (assignedTo === "unassigned") {
        queryBuilder = queryBuilder.is("assigned_to", null)
      } else {
        queryBuilder = queryBuilder.eq("assigned_to", assignedTo)
      }
    }

    // Due date range filter
    if (dueDateFrom) {
      queryBuilder = queryBuilder.gte("due_date", dueDateFrom)
    }
    if (dueDateTo) {
      queryBuilder = queryBuilder.lte("due_date", dueDateTo)
    }

    queryBuilder = queryBuilder.order("position", { ascending: true })

    const { data: visitors, error } = await queryBuilder

    if (error) throw error

    // Filter by label if specified (post-query since it's a many-to-many relationship)
    let filteredVisitors = visitors || []
    if (labelId) {
      filteredVisitors = filteredVisitors.filter((v: any) => v.labels?.some((vl: any) => vl.label?.id === labelId))
    }

    return NextResponse.json({ visitors: filteredVisitors })
  } catch (error) {
    console.error("[v0] Error searching visitors:", error)
    captureError(error, { endpoint: "/api/visitors/search", method: "GET" })
    return NextResponse.json({ error: "Failed to search visitors" }, { status: 500 })
  }
}
