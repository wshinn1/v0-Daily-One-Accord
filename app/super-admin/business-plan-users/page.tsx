import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BusinessPlanUserManagement } from "@/components/super-admin/business-plan-user-management"

export default async function BusinessPlanUsersPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is super admin
  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  console.log("[v0] Fetching business plan users...")

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(
      `
      id, 
      email, 
      full_name, 
      has_business_plan_access, 
      business_plan_invited_at, 
      business_plan_invited_by, 
      created_at
    `,
    )
    .order("created_at", { ascending: false })

  // Fetch NDA signatures separately
  const { data: ndaSignatures, error: ndaError } = await supabase
    .from("nda_signatures")
    .select("user_id, id, signed_at, pdf_url, document_version")

  console.log("[v0] NDA Signatures fetched:", {
    count: ndaSignatures?.length || 0,
    signatures: ndaSignatures,
  })

  // Join NDA signatures with users in code
  const usersWithNda = users?.map((user) => ({
    ...user,
    nda_signatures: ndaSignatures?.filter((nda) => nda.user_id === user.id) || [],
  }))

  console.log("[v0] Users with NDA data:", {
    totalUsers: usersWithNda?.length || 0,
    usersWithSignatures: usersWithNda?.filter((u) => u.nda_signatures && u.nda_signatures.length > 0).length || 0,
    sampleUserWithNda: usersWithNda?.find((u) => u.nda_signatures && u.nda_signatures.length > 0),
  })

  console.log("[v0] Users query result:", {
    totalUsers: usersWithNda?.length || 0,
    usersError,
    ndaError,
    usersWithAccess: usersWithNda?.filter((u) => u.has_business_plan_access).length || 0,
    usersWithoutAccess: usersWithNda?.filter((u) => !u.has_business_plan_access).length || 0,
  })

  if (usersError) {
    console.error("[v0] Error fetching users:", usersError)
  }

  if (ndaError) {
    console.error("[v0] Error fetching NDA signatures:", ndaError)
  }

  if (usersWithNda && usersWithNda.length > 0) {
    console.log("[v0] Sample user data:", usersWithNda[0])
  } else {
    console.log("[v0] No users found in database")
  }

  return <BusinessPlanUserManagement users={usersWithNda || []} />
}
