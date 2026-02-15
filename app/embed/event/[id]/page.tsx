import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EventRegistrationForm } from "@/components/calendar/event-registration-form"

export default async function EmbedEventPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: event } = await supabase
    .from("events")
    .select("*, church_tenants(name)")
    .eq("id", params.id)
    .eq("is_public", true)
    .eq("allow_registration", true)
    .single()

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <EventRegistrationForm event={event} />
    </div>
  )
}
