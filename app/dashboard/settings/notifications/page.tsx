import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form"

export default async function NotificationSettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("notification_settings, email, full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground mt-2">Manage how and when you receive notifications</p>
      </div>

      <NotificationPreferencesForm
        initialSettings={userData?.notification_settings || {}}
        userEmail={userData?.email || ""}
      />
    </div>
  )
}
