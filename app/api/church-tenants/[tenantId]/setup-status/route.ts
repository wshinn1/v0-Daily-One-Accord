import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler, DatabaseError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: Request, { params }: { params: { tenantId: string } }) => {
  const supabase = createServerClient()
  const tenantId = params.tenantId

  // Get tenant data
  const { data: tenant, error: tenantError } = await supabase
    .from("church_tenants")
    .select("*")
    .eq("id", tenantId)
    .single()

  if (tenantError) {
    throw new DatabaseError("Failed to fetch tenant data", { originalError: tenantError })
  }

  // Check for lead admin
  const { data: leadAdmin } = await supabase
    .from("church_members")
    .select("id")
    .eq("church_tenant_id", tenantId)
    .eq("role", "lead_admin")
    .limit(1)
    .single()

  // Check for Slack configuration
  const { data: slackConfig } = await supabase
    .from("slack_bot_configs")
    .select("id")
    .eq("church_tenant_id", tenantId)
    .limit(1)
    .single()

  const status = {
    hasLeadAdmin: !!leadAdmin,
    hasAccessCode: !!tenant?.access_code,
    hasBranding: !!(tenant?.logo_url || tenant?.primary_color),
    hasSlack: !!slackConfig,
    hasGoogleDrive: !!tenant?.google_drive_api_key,
    hasSMS: !!tenant?.telnyx_api_key,
  }

  return NextResponse.json(status)
})
