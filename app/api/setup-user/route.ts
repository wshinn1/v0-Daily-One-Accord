import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { NextResponse } from "next/server"
import { asyncHandler, AuthenticationError, DatabaseError } from "@/lib/errors/handler"

export const POST = asyncHandler(async () => {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated to set up account")
  }

  console.log("[v0] Creating user record for:", user.id, user.email)

  const supabaseAdmin = getSupabaseServiceRole()

  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (fetchError) {
    throw new DatabaseError("Failed to check user status", { originalError: fetchError })
  }

  if (existingUser) {
    console.log("[v0] User already exists:", existingUser)
    return NextResponse.json({ role: existingUser.role, church_tenant_id: existingUser.church_tenant_id })
  }

  const churchTenantId = user.user_metadata?.church_tenant_id || null
  const invitedRole = user.user_metadata?.role || "member"

  console.log("[v0] Creating new user with church_tenant_id:", churchTenantId, "role:", invitedRole)

  try {
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: invitedRole,
        church_tenant_id: churchTenantId,
        is_super_admin: false, // Default to false, must be granted by existing super admin
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError("Failed to create user record", { originalError: error })
    }

    console.log("[v0] User created successfully:", newUser)

    if (churchTenantId) {
      const { error: memberError } = await supabaseAdmin.from("church_members").insert({
        church_tenant_id: churchTenantId,
        user_id: user.id,
        role: invitedRole,
        joined_at: new Date().toISOString(),
      })

      if (memberError) {
        console.error("[v0] Error creating church member:", memberError)
      } else {
        console.log("[v0] Church member record created successfully")
      }
    }

    return NextResponse.json({ role: newUser.role, church_tenant_id: newUser.church_tenant_id })
  } catch (insertError: any) {
    console.error("[v0] Insert error:", insertError)

    if (insertError?.code === "23505" || insertError?.message?.includes("duplicate key")) {
      console.log("[v0] Duplicate key detected, fetching existing user")
      const { data: existingUserRetry, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError) {
        throw new DatabaseError("Failed to fetch existing user", { originalError: fetchError })
      }

      if (existingUserRetry) {
        console.log("[v0] Found existing user:", existingUserRetry)
        return NextResponse.json({
          role: existingUserRetry.role,
          church_tenant_id: existingUserRetry.church_tenant_id,
        })
      }
    }

    throw insertError
  }
})
