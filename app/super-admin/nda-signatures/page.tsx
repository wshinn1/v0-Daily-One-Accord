import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SuperAdminLayout } from "@/components/super-admin/super-admin-layout"
import { NDASignaturesView } from "@/components/super-admin/nda-signatures-view"

export default async function NDASignaturesPage() {
  const supabase = await createServerClient()

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
    .single()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  return (
    <SuperAdminLayout user={userData}>
      <NDASignaturesView />
    </SuperAdminLayout>
  )
}
