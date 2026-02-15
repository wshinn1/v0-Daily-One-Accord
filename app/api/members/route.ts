import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  AuthorizationError,
} from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to view members")
  }

  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get("groupId")

  // Get church tenant ID
  const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    throw new ValidationError("No church tenant found")
  }

  let query = supabase
    .from("member_directory")
    .select(`
      *,
      member_group_assignments(
        id,
        group_id,
        role,
        member_groups(id, name, group_type)
      )
    `)
    .eq("church_tenant_id", userData.church_tenant_id)
    .order("last_name", { ascending: true })

  if (groupId) {
    query = query.filter("member_group_assignments.group_id", "eq", groupId)
  }

  const { data: members, error } = await query

  if (error) {
    console.error("Error fetching members:", error)
    throw new DatabaseError("Failed to fetch members", error)
  }

  return NextResponse.json({ members })
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to create members")
  }

  // Get church tenant ID
  const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    throw new ValidationError("No church tenant found")
  }

  if (!["lead_admin", "admin_staff"].includes(userData.role)) {
    throw new AuthorizationError("Insufficient permissions to create members")
  }

  const body = await request.json()

  const { data: member, error } = await supabase
    .from("member_directory")
    .insert({
      ...body,
      church_tenant_id: userData.church_tenant_id,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating member:", error)
    throw new DatabaseError("Failed to create member", error)
  }

  return NextResponse.json({ member })
})

export const PUT = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to update members")
  }

  const body = await request.json()
  const { id, ...updates } = body

  const { data: member, error } = await supabase.from("member_directory").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating member:", error)
    throw new DatabaseError("Failed to update member", error)
  }

  return NextResponse.json({ member })
})

export const DELETE = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to delete members")
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    throw new ValidationError("Member ID required")
  }

  const { error } = await supabase.from("member_directory").delete().eq("id", id)

  if (error) {
    console.error("Error deleting member:", error)
    throw new DatabaseError("Failed to delete member", error)
  }

  return NextResponse.json({ success: true })
})
