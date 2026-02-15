import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ClassRegistrationForm } from "@/components/classes/class-registration-form"

export default async function ClassRegistrationPage({
  params,
}: {
  params: { classId: string }
}) {
  const supabase = createServerClient()

  // Fetch class details
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*, church_tenants(id, name, subdomain)")
    .eq("id", params.classId)
    .eq("is_active", true)
    .single()

  if (error || !classData) {
    notFound()
  }

  // Check if registration is open
  const now = new Date()
  const registrationStart = classData.registration_start_date ? new Date(classData.registration_start_date) : null
  const registrationEnd = classData.registration_end_date ? new Date(classData.registration_end_date) : null

  const isRegistrationOpen =
    (!registrationStart || now >= registrationStart) && (!registrationEnd || now <= registrationEnd)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ClassRegistrationForm classData={classData} isRegistrationOpen={isRegistrationOpen} />
      </div>
    </div>
  )
}
