import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler, DatabaseError, UnauthorizedError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const category = searchParams.get("category")

  // Verify super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new UnauthorizedError("Not authenticated")

  const { data: profile } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!profile?.is_super_admin) {
    throw new UnauthorizedError("Super admin access required")
  }

  // Build query
  let query = supabase
    .from("support_tickets")
    .select(`
      *,
      church_tenant:church_tenants(id, name),
      user:auth.users(id, email),
      assigned_user:auth.users!assigned_to(id, email)
    `)
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (priority) query = query.eq("priority", priority)
  if (category) query = query.eq("category", category)

  const { data: tickets, error } = await query

  if (error) {
    throw new DatabaseError("Failed to fetch support tickets", { originalError: error })
  }

  // Get ticket counts by status
  const { data: statusCounts } = await supabase
    .from("support_tickets")
    .select("status")
    .then(({ data }) => {
      const counts = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        total: data?.length || 0,
      }
      data?.forEach((ticket) => {
        counts[ticket.status as keyof typeof counts]++
      })
      return { data: counts }
    })

  return NextResponse.json({ tickets, statusCounts })
})

export const PATCH = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const body = await request.json()
  const { ticketId, status, priority, assigned_to } = body

  // Verify super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new UnauthorizedError("Not authenticated")

  const { data: profile } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!profile?.is_super_admin) {
    throw new UnauthorizedError("Super admin access required")
  }

  const updates: any = {}
  if (status) updates.status = status
  if (priority) updates.priority = priority
  if (assigned_to !== undefined) updates.assigned_to = assigned_to
  if (status === "resolved" || status === "closed") {
    updates.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("support_tickets").update(updates).eq("id", ticketId).select().single()

  if (error) {
    throw new DatabaseError("Failed to update ticket", { originalError: error })
  }

  return NextResponse.json(data)
})
