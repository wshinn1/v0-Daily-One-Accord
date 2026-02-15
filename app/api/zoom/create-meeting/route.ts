import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { asyncHandler, ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const body = await request.json()
  const { churchTenantId, topic, startTime, duration, type = "instant", slackChannelId } = body

  if (!churchTenantId || !topic) {
    throw new ValidationError("Missing required fields: churchTenantId and topic are required")
  }

  const supabase = getSupabaseServiceRole()

  // Get Zoom credentials
  const { data: zoomConfig, error: configError } = await supabase
    .from("zoom_integrations")
    .select("*")
    .eq("church_tenant_id", churchTenantId)
    .eq("is_active", true)
    .single()

  if (configError || !zoomConfig) {
    throw new ValidationError("Zoom not configured for this church")
  }

  // Check if token needs refresh
  let accessToken = zoomConfig.access_token
  if (zoomConfig.token_expires_at && new Date(zoomConfig.token_expires_at) < new Date()) {
    // Refresh token
    const refreshResponse = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${zoomConfig.client_id}:${zoomConfig.client_secret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: zoomConfig.refresh_token,
      }),
    })

    if (!refreshResponse.ok) {
      throw new ExternalAPIError("Failed to refresh Zoom token", {
        service: "Zoom OAuth",
        statusCode: refreshResponse.status,
      })
    }

    const refreshData = await refreshResponse.json()
    accessToken = refreshData.access_token

    // Update stored tokens
    const { error: updateError } = await supabase
      .from("zoom_integrations")
      .update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
      })
      .eq("id", zoomConfig.id)

    if (updateError) {
      throw new DatabaseError("Failed to update Zoom tokens", { originalError: updateError })
    }
  }

  // Create Zoom meeting
  const meetingPayload: any = {
    topic,
    type: type === "instant" ? 1 : 2,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,
      mute_upon_entry: false,
      waiting_room: false,
      audio: "both",
      auto_recording: "cloud",
    },
  }

  if (type === "scheduled" && startTime) {
    meetingPayload.start_time = new Date(startTime).toISOString()
    meetingPayload.duration = duration || 60
    meetingPayload.timezone = "America/New_York"
  }

  const zoomResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(meetingPayload),
  })

  if (!zoomResponse.ok) {
    const errorData = await zoomResponse.json()
    throw new ExternalAPIError("Failed to create Zoom meeting", {
      service: "Zoom API",
      statusCode: zoomResponse.status,
      responseData: errorData,
    })
  }

  const zoomMeeting = await zoomResponse.json()

  // Store meeting in database
  const { data: meeting, error: meetingError } = await supabase
    .from("zoom_meetings")
    .insert({
      church_tenant_id: churchTenantId,
      zoom_meeting_id: zoomMeeting.id.toString(),
      topic: zoomMeeting.topic,
      start_time: zoomMeeting.start_time || new Date().toISOString(),
      duration: zoomMeeting.duration,
      join_url: zoomMeeting.join_url,
      start_url: zoomMeeting.start_url,
      password: zoomMeeting.password,
      slack_channel_id: slackChannelId,
      meeting_type: type,
      status: "scheduled",
      metadata: zoomMeeting,
    })
    .select()
    .single()

  if (meetingError) {
    throw new DatabaseError("Failed to store Zoom meeting", { originalError: meetingError })
  }

  return NextResponse.json({
    success: true,
    meeting: {
      id: meeting.id,
      zoomMeetingId: zoomMeeting.id,
      topic: zoomMeeting.topic,
      joinUrl: zoomMeeting.join_url,
      startUrl: zoomMeeting.start_url,
      password: zoomMeeting.password,
      startTime: zoomMeeting.start_time,
    },
  })
})
