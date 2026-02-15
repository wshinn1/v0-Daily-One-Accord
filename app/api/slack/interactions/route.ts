import { type NextRequest, NextResponse } from "next/server"
import { verifySlackRequest } from "@/lib/slack-verify"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { asyncHandler, AuthenticationError, ExternalAPIError, ValidationError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  try {
    const body = await request.text()
    const payload = JSON.parse(new URLSearchParams(body).get("payload") || "{}")

    const teamId = payload.team?.id
    const supabase = getSupabaseServiceRole()

    const { data: botConfig } = await supabase
      .from("slack_bot_configs")
      .select("signing_secret, bot_token")
      .eq("team_id", teamId)
      .single()

    if (!botConfig) {
      throw new ValidationError("Bot not configured")
    }

    const timestamp = request.headers.get("x-slack-request-timestamp")
    const signature = request.headers.get("x-slack-signature")

    if (!timestamp || !signature) {
      throw new AuthenticationError("Missing verification headers")
    }

    const isValid = verifySlackRequest(body, timestamp, signature, botConfig.signing_secret)
    if (!isValid) {
      throw new AuthenticationError("Invalid signature")
    }

    // Handle Zoom meeting creation submission
    if (payload.type === "view_submission" && payload.view.callback_id === "zoom_meeting_creation") {
      const values = payload.view.state.values
      const metadata = JSON.parse(payload.view.private_metadata)

      const topic = values.topic_block.topic_input.value
      const type = values.type_block.type_select.selected_option.value
      const datetime = values.datetime_block?.datetime_select?.selected_date_time
      const duration = values.duration_block?.duration_input?.value || 60
      const postOption = values.post_block.post_select.selected_option.value

      // Create Zoom meeting
      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/zoom/create-meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchTenantId: metadata.church_tenant_id,
          topic,
          startTime: datetime ? new Date(datetime * 1000).toISOString() : null,
          duration: Number.parseInt(duration),
          type,
          slackChannelId: postOption === "current" ? metadata.channel_id : null,
        }),
      })

      if (!createResponse.ok) {
        throw new ExternalAPIError("Failed to create Zoom meeting")
      }

      const { meeting } = await createResponse.json()

      // Post to Slack channel if requested
      if (postOption === "current") {
        const messageBlocks = [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `📹 ${meeting.topic}`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Join URL:*\n<${meeting.joinUrl}|Click to Join Meeting>`,
              },
              {
                type: "mrkdwn",
                text: `*Meeting ID:*\n${meeting.zoomMeetingId}`,
              },
            ],
          },
        ]

        if (meeting.password) {
          messageBlocks.push({
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Password:*\n${meeting.password}`,
              },
            ],
          })
        }

        if (meeting.startTime) {
          messageBlocks.push({
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⏰ Scheduled for <!date^${Math.floor(new Date(meeting.startTime).getTime() / 1000)}^{date_short_pretty} at {time}|${meeting.startTime}>`,
              },
            ],
          })
        }

        await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${botConfig.bot_token}`,
          },
          body: JSON.stringify({
            channel: metadata.channel_id,
            blocks: messageBlocks,
            text: `Zoom Meeting: ${meeting.topic} - ${meeting.joinUrl}`,
          }),
        })
      }

      return NextResponse.json({
        response_action: "clear",
      })
    }

    // Handle attendance submission (existing code)
    if (payload.type === "view_submission" && payload.view.callback_id === "attendance_submission") {
      // ... existing attendance code ...
      return NextResponse.json({ response_action: "clear" })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Slack interaction error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
})
