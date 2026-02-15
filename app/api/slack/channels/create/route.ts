import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { asyncHandler, ExternalAPIError, DatabaseError, ValidationError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await getSupabaseServerClient()
  const { tenantId, channelName, isPrivate } = await request.json()

  console.log("[v0] Creating Slack channel:", { tenantId, channelName, isPrivate })

  if (!tenantId || !channelName) {
    throw new ValidationError("Tenant ID and channel name are required")
  }

  // Get the Slack configuration for this tenant
  const { data: slackConfig, error: configError } = await supabase
    .from("slack_integrations")
    .select("*")
    .eq("church_tenant_id", tenantId)
    .eq("is_active", true)
    .single()

  if (configError || !slackConfig) {
    console.error("[v0] Slack config error:", configError)
    throw new DatabaseError("Slack integration not found", configError)
  }

  console.log("[v0] Using bot token to create channel")

  // Call Slack API to create channel
  const response = await fetch("https://slack.com/api/conversations.create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${slackConfig.bot_token}`,
    },
    body: JSON.stringify({
      name: channelName,
      is_private: isPrivate || false,
    }),
  })

  const data = await response.json()
  console.log("[v0] Slack API response:", data)

  if (!data.ok) {
    console.error("[v0] Slack API error:", data.error)
    throw new ExternalAPIError(`Slack API error: ${data.error}`, { details: data })
  }

  // Save the new channel to the database
  const { error: insertError } = await supabase.from("slack_channels").insert({
    slack_integration_id: slackConfig.id,
    channel_name: data.channel.name,
    channel_id: data.channel.id,
  })

  if (insertError) {
    console.error("[v0] Error saving channel:", insertError)
    throw new DatabaseError("Failed to save channel", insertError)
  }

  console.log("[v0] Channel created successfully:", data.channel.name)

  return NextResponse.json({
    success: true,
    channel: {
      id: data.channel.id,
      name: data.channel.name,
      is_private: data.channel.is_private,
    },
  })
})
