import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NDASigningForm } from "@/components/business-plan/nda-signing-form"

export default async function NDAPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/business-plan/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, has_business_plan_access")
    .eq("id", user.id)
    .single()

  if (!userData || !userData.has_business_plan_access) {
    redirect("/business-plan/login")
  }

  // Check if user has already signed the NDA
  const { data: existingSignature } = await supabase
    .from("nda_signatures")
    .select("id, signed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingSignature) {
    // Already signed, redirect to business plan
    redirect("/business-plan")
  }

  return (
    <div className="min-h-screen bg-background">
      <NDASigningForm user={userData} />
    </div>
  )
}
