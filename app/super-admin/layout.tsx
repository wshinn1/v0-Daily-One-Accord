import type React from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"

export default async function SuperAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("is_super_admin, full_name, email")
    .eq("id", user.id)
    .maybeSingle()

  if (!userData) {
    redirect("/setup-profile")
  }

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  return <SuperAdminLayout user={userData}>{children}</SuperAdminLayout>
}
