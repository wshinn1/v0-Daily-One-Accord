import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { ValidationError, DatabaseError } from "@/lib/errors/types"

export const GET = asyncHandler(async (request: NextRequest) => {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const churchTenantId = searchParams.get("churchTenantId")

  if (!churchTenantId) {
    throw new ValidationError("Missing churchTenantId parameter")
  }

  const { data: bridges, error } = await supabase
    .from("message_bridges")
    .select(`
      *,
      groupme_bots(bot_id, group_name)
    `)
    .eq("church_tenant_id", churchTenantId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new DatabaseError("Failed to fetch message bridges", { originalError: error })
  }

  return NextResponse.json({ bridges })
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createClient()
  const body = await request.json()

  const { data: bridge, error } = await supabase
    .from("message_bridges")
    .insert({
      church_tenant_id: body.churchTenantId,
      name: body.name,
      slack_channel_id: body.slackChannelId,
      slack_channel_name: body.slackChannelName,
      groupme_group_id: body.groupmeGroupId,
      groupme_group_name: body.groupmeGroupName,
      groupme_bot_id: body.groupmeBotId,
      sync_direction: body.syncDirection || "bidirectional",
      include_sender_name: body.includeSenderName ?? true,
      format_messages: body.formatMessages ?? true,
      sync_attachments: body.syncAttachments ?? true,
      enabled: true,
    })
    .select()
    .single()

  if (error) {
    throw new DatabaseError("Failed to create message bridge", { originalError: error })
  }

  return NextResponse.json({ success: true, bridge })
})

export const PATCH = asyncHandler(async (request: NextRequest) => {
  const supabase = await createClient()
  const body = await request.json()
  const { bridgeId, ...updates } = body

  if (!bridgeId) {
    throw new ValidationError("Missing bridgeId in request body")
  }

  const { data: bridge, error } = await supabase
    .from("message_bridges")
    .update(updates)
    .eq("id", bridgeId)
    .select()
    .single()

  if (error) {
    throw new DatabaseError("Failed to update message bridge", { originalError: error })
  }

  return NextResponse.json({ success: true, bridge })
})

export const DELETE = asyncHandler(async (request: NextRequest) => {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const bridgeId = searchParams.get("bridgeId")

  if (!bridgeId) {
    throw new ValidationError("Missing bridgeId parameter")
  }

  const { error } = await supabase.from("message_bridges").delete().eq("id", bridgeId)

  if (error) {
    throw new DatabaseError("Failed to delete message bridge", { originalError: error })
  }

  return NextResponse.json({ success: true })
})
