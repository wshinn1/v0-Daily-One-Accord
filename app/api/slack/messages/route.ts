import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const channelId = searchParams.get("channelId")
  const tenantId = searchParams.get("tenantId")

  console.log("[v0] Fetching messages for channel:", channelId, "tenant:", tenantId)

  if (!channelId || !tenantId) {
    throw new ValidationError("Missing channelId or tenantId")
  }

  const supabase = await createServerClient()

  // Get Slack bot token
  const { data: tenant, error: tenantError } = await supabase
    .from("church_tenants")
    .select("slack_bot_token")
    .eq("id", tenantId)
    .single()

  console.log("[v0] Tenant data:", { found: !!tenant, hasToken: !!tenant?.slack_bot_token, error: tenantError })

  if (tenantError) {
    throw new DatabaseError("Failed to fetch tenant", { error: tenantError })
  }

  if (!tenant?.slack_bot_token) {
    throw new ValidationError("Slack not configured for this tenant")
  }

  const tenDaysAgo = Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60

  // Fetch messages from Slack
  console.log("[v0] Calling Slack API for messages...")
  const response = await fetch(
    `https://slack.com/api/conversations.history?channel=${channelId}&limit=100&oldest=${tenDaysAgo}`,
    {
      headers: {
        Authorization: `Bearer ${tenant.slack_bot_token}`,
      },
    },
  )

  const data = await response.json()
  console.log("[v0] Slack messages API response:", {
    ok: data.ok,
    error: data.error,
    messageCount: data.messages?.length,
  })

  if (!data.ok) {
    throw new ExternalAPIError("Failed to fetch Slack messages", { error: data.error })
  }

  return NextResponse.json({ messages: data.messages })
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const { channelId, tenantId, text, userName } = await request.json()

  console.log("[v0] Sending message to channel:", channelId, "tenant:", tenantId, "user:", userName)

  if (!channelId || !tenantId || !text) {
    throw new ValidationError("Missing required fields")
  }

  const supabase = await createServerClient()

  // Get Slack bot token
  const { data: tenant } = await supabase.from("church_tenants").select("slack_bot_token").eq("id", tenantId).single()

  if (!tenant?.slack_bot_token) {
    throw new ValidationError("Slack not configured for this tenant")
  }

  const formattedText = userName ? `*${userName}:* ${text}` : text

  // Send message to Slack
  console.log("[v0] Posting message to Slack...")
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tenant.slack_bot_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: channelId,
      text: formattedText,
    }),
  })

  const data = await response.json()
  console.log("[v0] Slack post message response:", { ok: data.ok, error: data.error })

  if (!data.ok) {
    throw new ExternalAPIError("Failed to send Slack message", { error: data.error })
  }

  return NextResponse.json({ success: true, message: data.message })
})
