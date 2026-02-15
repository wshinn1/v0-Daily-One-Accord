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
    throw new AuthenticationError("User must be authenticated to view groups")
  }

  // Get church tenant ID
  const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    throw new ValidationError("No church tenant found")
  }

  const { data: groups, error } = await supabase
    .from("member_groups")
    .select(`
      *,
      leader:leader_id(id, first_name, last_name),
      member_group_assignments(count)
    `)
    .eq("church_tenant_id", userData.church_tenant_id)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching groups:", error)
    throw new DatabaseError("Failed to fetch groups", error)
  }

  return NextResponse.json({ groups })
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to create groups")
  }

  // Get church tenant ID
  const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    throw new ValidationError("No church tenant found")
  }

  if (!["lead_admin", "admin_staff"].includes(userData.role)) {
    throw new AuthorizationError("Insufficient permissions to create groups")
  }

  const body = await request.json()

  const { data: group, error } = await supabase
    .from("member_groups")
    .insert({
      ...body,
      church_tenant_id: userData.church_tenant_id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating group:", error)
    throw new DatabaseError("Failed to create group", error)
  }

  return NextResponse.json({ group })
})
