import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ExternalAPIError, DatabaseError, ValidationError } from "@/lib/errors/handler"

export const GET = asyncHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  console.log("[v0] OAuth callback received:", { code: !!code, state: !!state, error })

  if (error) {
    return NextResponse.redirect(new URL(`/super-admin?error=${error}`, request.url))
  }

  if (!code || !state) {
    throw new ValidationError("Missing OAuth parameters")
  }

  // Decode state to get church ID
  const { churchId } = JSON.parse(atob(state))
  console.log("[v0] Church ID from state:", churchId)

  const supabase = await createServerClient()

  const { data: churchData, error: churchError } = await supabase
    .from("church_tenants")
    .select("slack_client_id, slack_client_secret")
    .eq("id", churchId)
    .single()

  if (churchError || !churchData?.slack_client_id || !churchData?.slack_client_secret) {
    console.error("[v0] Failed to fetch church credentials:", churchError)
    throw new DatabaseError("Slack credentials not configured for this church")
  }

  console.log("[v0] Exchanging code for token...")

  // Exchange code for access token
  const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: churchData.slack_client_id,
      client_secret: churchData.slack_client_secret,
      code,
      redirect_uri: `${new URL(request.url).origin}/api/slack/oauth/callback`,
    }),
  })

  const tokenData = await tokenResponse.json()
  console.log("[v0] Token exchange result:", { ok: tokenData.ok, error: tokenData.error })

  if (!tokenData.ok) {
    throw new ExternalAPIError(`Slack OAuth failed: ${tokenData.error || "Unknown error"}`)
  }

  // Store tokens in database
  const { error: updateError } = await supabase
    .from("church_tenants")
    .update({
      slack_bot_token: tokenData.access_token,
      slack_access_token: tokenData.authed_user?.access_token,
      slack_team_id: tokenData.team?.id,
      slack_oauth_configured: true,
    })
    .eq("id", churchId)

  if (updateError) {
    console.error("[v0] Failed to update church tokens:", updateError)
    throw new DatabaseError("Failed to save Slack tokens")
  }

  console.log("[v0] Tokens saved successfully")

  // Fetch and cache channels
  const channelsResponse = await fetch("https://slack.com/api/conversations.list", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  const channelsData = await channelsResponse.json()
  console.log("[v0] Channels fetch result:", { ok: channelsData.ok, count: channelsData.channels?.length })

  if (channelsData.ok && channelsData.channels) {
    // Store channels in database
    const channelsToInsert = channelsData.channels.map((channel: any) => ({
      church_tenant_id: churchId,
      channel_id: channel.id,
      channel_name: channel.name,
      is_private: channel.is_private || false,
    }))

    await supabase.from("slack_channels").upsert(channelsToInsert, {
      onConflict: "church_tenant_id,channel_id",
    })
    console.log("[v0] Channels cached successfully")
  }

  return NextResponse.redirect(new URL("/super-admin?slack_configured=true", request.url))
})
