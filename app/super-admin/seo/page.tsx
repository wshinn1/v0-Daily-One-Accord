import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SeoSettingsView } from "@/components/super-admin/seo-settings-view"

export const metadata = {
  title: "SEO Settings - Super Admin",
  description: "Manage site-wide SEO configuration",
}

export default async function SeoSettingsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).maybeSingle()

  if (!userData?.is_super_admin) {
    redirect("/dashboard")
  }

  const { data: seoSettings } = await supabase.from("seo_settings").select("*").single()

  return <SeoSettingsView initialSettings={seoSettings} />
}
