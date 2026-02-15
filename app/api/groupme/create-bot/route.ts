import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError, AuthenticationError, ExternalAPIError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: NextRequest) => {
  const { groupId, groupName, accessToken, churchTenantId } = await request.json()

  if (!groupId || !accessToken || !churchTenantId) {
    throw new ValidationError("Group ID, access token, and church tenant ID are required")
  }

  const supabase = await createClient()

  // Verify user has permission
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User not authenticated")
  }

  // Create callback URL for this bot
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/groupme/webhook`

  // Create bot in GroupMe
  const response = await fetch("https://api.groupme.com/v3/bots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Token": accessToken,
    },
    body: JSON.stringify({
      bot: {
        name: "Daily One Accord Bot",
        group_id: groupId,
        callback_url: callbackUrl,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.response?.bot) {
    throw new ExternalAPIError("Failed to create GroupMe bot", "GroupMe")
  }

  const bot = data.response.bot

  // Store bot configuration in database
  const { data: botConfig, error } = await supabase
    .from("groupme_bots")
    .insert({
      church_tenant_id: churchTenantId,
      bot_id: bot.bot_id,
      group_id: groupId,
      group_name: groupName || bot.group_name,
      bot_token: accessToken,
      callback_url: callbackUrl,
    })
    .select()
    .single()

  if (error) {
    throw new DatabaseError("Failed to store GroupMe bot configuration", { cause: error })
  }

  return NextResponse.json({ success: true, bot: botConfig })
})
