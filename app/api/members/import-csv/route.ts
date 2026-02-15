import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  asyncHandler,
  AuthenticationError,
  ValidationError,
  DatabaseError,
  AuthorizationError,
} from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError("User must be authenticated to import members")
  }

  // Get church tenant ID
  const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    throw new ValidationError("No church tenant found")
  }

  if (!["lead_admin", "admin_staff"].includes(userData.role)) {
    throw new AuthorizationError("Insufficient permissions to import members")
  }

  const body = await request.json()
  const { members } = body

  if (!Array.isArray(members) || members.length === 0) {
    throw new ValidationError("No members provided")
  }

  // Prepare members for insertion
  const membersToInsert = members.map((member: any) => ({
    church_tenant_id: userData.church_tenant_id,
    first_name: member.first_name || member.firstName || "",
    last_name: member.last_name || member.lastName || "",
    email: member.email || null,
    phone: member.phone || null,
    street_address: member.street_address || member.address || null,
    city: member.city || null,
    state: member.state || null,
    zip_code: member.zip_code || member.zipCode || member.zip || null,
    country: member.country || "USA",
    date_of_birth: member.date_of_birth || member.dob || null,
    gender: member.gender || null,
    marital_status: member.marital_status || member.maritalStatus || null,
    membership_status: member.membership_status || member.status || "active",
    join_date: member.join_date || member.joinDate || null,
    notes: member.notes || null,
    created_by: user.id,
  }))

  const { data: insertedMembers, error: insertError } = await supabase
    .from("member_directory")
    .upsert(membersToInsert, {
      onConflict: "church_tenant_id,email",
      ignoreDuplicates: false,
    })
    .select()

  if (insertError) {
    console.error("Error inserting members:", insertError)
    throw new DatabaseError("Failed to import members", insertError)
  }

  return NextResponse.json({
    success: true,
    imported: insertedMembers?.length || 0,
    members: insertedMembers,
  })
})
