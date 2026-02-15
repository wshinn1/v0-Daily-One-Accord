import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const tenantId = searchParams.get("tenantId")
  const userIds = searchParams.get("userIds")?.split(",") || []

  if (!tenantId) {
    throw new ValidationError("Missing tenantId parameter")
  }

  const supabase = await createServerClient()

  // Get Slack bot token
  const { data: tenant, error: tenantError } = await supabase
    .from("church_tenants")
    .select("slack_bot_token")
    .eq("id", tenantId)
    .single()

  if (tenantError) {
    throw new DatabaseError("Failed to fetch tenant", tenantError)
  }

  if (!tenant?.slack_bot_token) {
    throw new ValidationError("Slack not configured for this tenant")
  }

  // Fetch user info for each user ID
  const userMap: Record<string, { name: string; real_name: string }> = {}

  for (const userId of userIds) {
    if (!userId) continue

    const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
      headers: {
        Authorization: `Bearer ${tenant.slack_bot_token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ExternalAPIError("Slack API request failed", { userId, status: response.status })
    }

    if (data.ok && data.user) {
      userMap[userId] = {
        name: data.user.name || data.user.profile?.display_name || "Unknown",
        real_name: data.user.real_name || data.user.profile?.real_name || data.user.name || "Unknown User",
      }
    }
  }

  return NextResponse.json({ users: userMap })
})
