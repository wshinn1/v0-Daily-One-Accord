import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const formData = await request.formData()
  const file = formData.get("file") as File
  const channelId = formData.get("channelId") as string
  const tenantId = formData.get("tenantId") as string
  const userName = formData.get("userName") as string

  if (!file || !channelId || !tenantId) {
    throw new ValidationError("Missing required fields")
  }

  // Get bot token from database
  const supabase = await createServerClient()
  const { data: tenant, error: tenantError } = await supabase
    .from("church_tenants")
    .select("slack_bot_token")
    .eq("id", tenantId)
    .single()

  if (tenantError || !tenant?.slack_bot_token) {
    throw new DatabaseError("Slack not configured")
  }

  // Upload file to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
  })

  // Upload file to Slack
  const slackFormData = new FormData()
  slackFormData.append("channels", channelId)
  slackFormData.append("initial_comment", `**${userName}** uploaded a file`)
  slackFormData.append("file", file)

  const slackResponse = await fetch("https://slack.com/api/files.upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tenant.slack_bot_token}`,
    },
    body: slackFormData,
  })

  const slackData = await slackResponse.json()

  if (!slackData.ok) {
    console.error("[v0] Slack file upload error:", slackData)
    throw new ExternalAPIError(`Slack upload failed: ${slackData.error || "Unknown error"}`)
  }

  return NextResponse.json({ success: true, blobUrl: blob.url })
})
