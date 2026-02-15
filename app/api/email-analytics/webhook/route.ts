import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client"

// Resend webhook handler for email events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    const supabase = getSupabaseServiceRoleClient()

    // Handle different event types
    switch (type) {
      case "email.sent":
        // Track email sent
        await supabase.from("email_analytics").insert({
          email_id: data.email_id,
          recipient_email: data.to,
          subject: data.subject,
          email_type: data.tags?.type || "other",
          church_tenant_id: data.tags?.church_tenant_id,
          sent_at: new Date().toISOString(),
          metadata: data,
        })
        break

      case "email.opened":
        // Track email opened
        await supabase
          .from("email_analytics")
          .update({
            opened_at: new Date().toISOString(),
            open_count: supabase.rpc("increment", { row_id: data.email_id }),
          })
          .eq("email_id", data.email_id)
        break

      case "email.clicked":
        // Track email clicked
        await supabase
          .from("email_analytics")
          .update({
            clicked_at: new Date().toISOString(),
            click_count: supabase.rpc("increment", { row_id: data.email_id }),
          })
          .eq("email_id", data.email_id)
        break

      case "email.bounced":
        // Track email bounced
        await supabase
          .from("email_analytics")
          .update({
            bounced_at: new Date().toISOString(),
            bounce_type: data.bounce_type,
          })
          .eq("email_id", data.email_id)
        break

      default:
        console.log(`Unhandled webhook event type: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
