import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { PitchDeckContent } from "@/components/super-admin/pitch-deck-content"

export default async function PitchDeckPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin, full_name").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  return <PitchDeckContent />
}
