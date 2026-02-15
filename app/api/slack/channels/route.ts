import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { asyncHandler, AuthenticationError, ExternalAPIError, ValidationError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const tenantId = searchParams.get("tenantId")

  console.log("[v0] Fetching Slack channels for tenant:", tenantId)

  if (!tenantId) {
    throw new ValidationError("Tenant ID required")
  }

  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  console.log("[v0] Auth user:", user?.id, "Error:", authError)

  if (!user) {
    throw new AuthenticationError("Not authenticated")
  }

  const { data: churchData, error: churchError } = await supabase
    .from("church_tenants")
    .select("slack_bot_token, slack_oauth_configured")
    .eq("id", tenantId)
    .single()

  console.log("[v0] Church data:", {
    found: !!churchData,
    configured: churchData?.slack_oauth_configured,
    error: churchError,
  })

  if (churchError) {
    console.error("[v0] Church query error:", churchError)
    throw new ExternalAPIError("Database error", { details: churchError.message })
  }

  if (!churchData?.slack_oauth_configured || !churchData?.slack_bot_token) {
    return NextResponse.json({ error: "Slack not configured for this tenant" }, { status: 404 })
  }

  console.log("[v0] Calling Slack API with bot token...")
  const response = await fetch("https://slack.com/api/conversations.list", {
    headers: {
      Authorization: `Bearer ${churchData.slack_bot_token}`,
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  console.log("[v0] Slack API response:", { ok: data.ok, error: data.error, channelCount: data.channels?.length })

  if (!data.ok) {
    console.error("[v0] Slack API error:", data.error)
    throw new ExternalAPIError(`Slack API error: ${data.error}`, {
      details: "Make sure your bot token has the 'channels:read' scope",
    })
  }

  const channels = data.channels
    .filter((ch: any) => !ch.is_archived)
    .map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      is_member: ch.is_member,
      is_private: ch.is_private,
    }))

  console.log("[v0] Returning channels:", channels.length)

  return NextResponse.json({ channels })
})
