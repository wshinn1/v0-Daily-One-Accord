import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RecurringDonationsView } from "@/components/giving/recurring-donations-view"

export default async function RecurringDonationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

  if (!userData?.church_tenant_id) {
    redirect("/dashboard")
  }

  // Fetch recurring donations
  const { data: recurringDonations } = await supabase
    .from("recurring_donations")
    .select(
      `
      *,
      donors (
        id,
        email,
        first_name,
        last_name,
        phone
      ),
      giving_funds (
        id,
        name,
        color
      )
    `,
    )
    .eq("church_tenant_id", userData.church_tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <RecurringDonationsView recurringDonations={recurringDonations || []} />
    </div>
  )
}
