import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { AuthenticationError, DatabaseError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  console.log("[v0] 🔵 SYNC: Starting user sync process")

  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  console.log("[v0] 🔵 SYNC: Auth user:", authUser?.id)

  if (!authUser) {
    throw new AuthenticationError("User must be authenticated")
  }

  // Check if user is super admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("is_super_admin")
    .eq("id", authUser.id)
    .single()

  console.log("[v0] 🔵 SYNC: User data:", userData, "Error:", userError)

  if (!userData?.is_super_admin) {
    throw new AuthenticationError("Forbidden - Super admin only")
  }

  console.log("[v0] 🟢 SYNC: User is super admin, proceeding with sync")

  // Find users missing from church_members
  const { data: missingUsers, error: findError } = await supabase
    .from("users")
    .select("id, email, full_name, church_tenant_id, role, created_at")
    .not("church_tenant_id", "is", null)
    .eq("is_super_admin", false)

  console.log("[v0] 🔵 SYNC: Found users with church_tenant_id:", missingUsers?.length, "Error:", findError)

  if (findError) {
    console.error("[v0] 🔴 SYNC: Error finding users:", findError)
    throw new DatabaseError("Failed to find users", { originalError: findError })
  }

  if (!missingUsers || missingUsers.length === 0) {
    console.log("[v0] 🟡 SYNC: No users to sync")
    return NextResponse.json({ message: "No users to sync", synced: 0 })
  }

  // Check which users are actually missing from church_members
  const usersToSync = []
  for (const user of missingUsers) {
    const { data: existing, error: checkError } = await supabase
      .from("church_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("church_tenant_id", user.church_tenant_id)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] 🔴 SYNC: Error checking existing member:", checkError)
    }

    if (!existing) {
      console.log("[v0] 🟡 SYNC: User needs sync:", user.email)
      usersToSync.push(user)
    }
  }

  console.log(`[v0] 🟢 SYNC: Found ${usersToSync.length} users to sync`)

  // Create missing church_members records
  const membersToInsert = usersToSync.map((user) => ({
    user_id: user.id,
    church_tenant_id: user.church_tenant_id,
    role: user.role,
    joined_at: user.created_at,
    is_active: true,
  }))

  if (membersToInsert.length > 0) {
    console.log("[v0] 🔵 SYNC: Inserting members:", membersToInsert)

    const { error: insertError } = await supabase.from("church_members").insert(membersToInsert)

    if (insertError) {
      console.error("[v0] 🔴 SYNC: Error inserting members:", insertError)
      throw new DatabaseError("Failed to sync members", { originalError: insertError })
    }

    console.log("[v0] 🟢 SYNC: Successfully inserted members")
  }

  return NextResponse.json({
    message: "Users synced successfully",
    synced: usersToSync.length,
    users: usersToSync.map((u) => ({ email: u.email, name: u.full_name })),
  })
})
