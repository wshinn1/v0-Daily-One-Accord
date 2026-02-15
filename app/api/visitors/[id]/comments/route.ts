import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { captureError } from "@/lib/errors/sentry"

function stripUUIDsFromMentions(text: string): string {
  let result = text
  let searchIndex = 0

  while (searchIndex < result.length) {
    const mentionStart = result.indexOf("@[", searchIndex)
    if (mentionStart === -1) break

    const nameEnd = result.indexOf("](", mentionStart + 2)
    if (nameEnd === -1) break

    const idEnd = result.indexOf(")", nameEnd + 2)
    if (idEnd === -1) break

    const name = result.substring(mentionStart + 2, nameEnd)
    // Replace @[Name](uuid) with just @Name
    result = result.substring(0, mentionStart) + "@" + name + result.substring(idEnd + 1)
    searchIndex = mentionStart + name.length + 1
  }

  return result
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: comments, error } = await supabase
      .from("visitor_comments")
      .select("*, user:users(id, full_name)")
      .eq("visitor_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    if (error instanceof Error) {
      captureError(error, { endpoint: "/api/visitors/[id]/comments", method: "GET", visitorId: params.id })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("church_tenant_id, full_name")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { comment_text } = body

    console.log("[v0 API] Received comment:", comment_text)

    if (!comment_text || comment_text.trim() === "") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    const { data: visitorData } = await supabase.from("visitors").select("full_name").eq("id", id).single()

    const { data: comment, error } = await supabase
      .from("visitor_comments")
      .insert({
        visitor_id: id,
        church_tenant_id: userData.church_tenant_id,
        user_id: user.id,
        comment_text: comment_text.trim(),
      })
      .select("*, user:users(id, full_name)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0 API] Starting mention parsing...")
    const mentions: Array<{ name: string; userId: string }> = []
    let searchIndex = 0

    while (searchIndex < comment_text.length) {
      const mentionStart = comment_text.indexOf("@[", searchIndex)
      console.log("[v0 API] Looking for mention at index:", searchIndex, "Found at:", mentionStart)

      if (mentionStart === -1) break

      const nameEnd = comment_text.indexOf("](", mentionStart + 2)
      console.log("[v0 API] Looking for name end, found at:", nameEnd)
      if (nameEnd === -1) break

      const idEnd = comment_text.indexOf(")", nameEnd + 2)
      console.log("[v0 API] Looking for id end, found at:", idEnd)
      if (idEnd === -1) break

      const name = comment_text.substring(mentionStart + 2, nameEnd)
      const userId = comment_text.substring(nameEnd + 2, idEnd)

      console.log("[v0 API] Found mention - Name:", name, "UserId:", userId)
      mentions.push({ name, userId })
      searchIndex = idEnd + 1
    }

    console.log("[v0 API] Total mentions found:", mentions.length, mentions)

    if (mentions.length > 0) {
      try {
        console.log("[v0 API] Fetching Slack config for tenant:", userData.church_tenant_id)
        const { data: slackConfig } = await supabase
          .from("slack_integrations")
          .select("*")
          .eq("church_tenant_id", userData.church_tenant_id)
          .eq("is_active", true)
          .single()

        console.log("[v0 API] Slack config found:", !!slackConfig)
        console.log("[v0 API] Notification settings:", slackConfig?.notification_settings)

        if (slackConfig) {
          const { data: mentionedUsers } = await supabase
            .from("users")
            .select("id, full_name, email, slack_user_id")
            .in(
              "id",
              mentions.map((m) => m.userId),
            )

          console.log("[v0 API] Mentioned users from DB:", mentionedUsers)

          if (mentionedUsers && mentionedUsers.length > 0) {
            const notificationInserts = mentionedUsers.map((mentionedUser) => ({
              user_id: mentionedUser.id,
              visitor_id: id,
              comment_id: comment.id,
              commenter_id: user.id,
              notification_type: "mention",
              message: `${userData.full_name} mentioned you in a comment on ${visitorData?.full_name || "a visitor"}`,
            }))

            const { error: notificationError } = await supabase.from("notifications").insert(notificationInserts)

            if (notificationError) {
              console.error("[v0 API] Error creating notifications:", notificationError)
            } else {
              console.log("[v0 API] Created", notificationInserts.length, "in-app notifications")
            }

            const notificationSettings = slackConfig.notification_settings || {}

            const eventSettings = notificationSettings.visitor_comment_mention
            const legacyChannelId = notificationSettings.visitor_comment_channel

            const channelId = eventSettings?.channel_id || legacyChannelId
            const isEnabled = eventSettings?.enabled !== false

            console.log("[v0 API] Event settings for visitor_comment_mention:", eventSettings)
            console.log("[v0 API] Legacy channel ID:", legacyChannelId)
            console.log("[v0 API] Is enabled:", isEnabled)
            console.log("[v0 API] Channel ID:", channelId)

            if (isEnabled && channelId) {
              const mentionText = mentionedUsers
                .map((u) => (u.slack_user_id ? `<@${u.slack_user_id}>` : `@${u.full_name}`))
                .join(", ")

              console.log("[v0 API] Mention text for Slack:", mentionText)

              const cleanCommentText = stripUUIDsFromMentions(comment_text)
              console.log("[v0 API] Clean comment text for Slack:", cleanCommentText)

              const slackPayload = {
                tenantId: userData.church_tenant_id,
                eventType: "visitor_comment_mention",
                data: {
                  visitor_name: visitorData?.full_name || "Unknown Visitor",
                  commenter_name: userData.full_name,
                  comment_text: cleanCommentText,
                  mentioned_users: mentionText,
                  visitor_id: id,
                },
              }

              console.log("[v0 API] Sending Slack notification with payload:", JSON.stringify(slackPayload, null, 2))

              const slackResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/slack/notify`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(slackPayload),
                },
              )

              const slackResult = await slackResponse.json()
              console.log("[v0 API] Slack notification response:", slackResponse.status, slackResult)
            } else {
              console.log("[v0 API] Visitor comment mentions not enabled or no channel configured")
              console.log(
                "[v0 API] To enable: Go to Dashboard → Slack → Notifications → Enable 'Visitor Comment Mentions'",
              )
            }
          } else {
            console.log("[v0 API] No mentioned users found in database")
          }
        } else {
          console.log("[v0 API] No active Slack integration found for tenant")
        }
      } catch (slackError) {
        console.error("[v0 API] Error sending Slack notification:", slackError)
      }
    } else {
      console.log("[v0 API] No mentions found in comment")
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("[v0 API] Error in POST handler:", error)
    if (error instanceof Error) {
      captureError(error, { endpoint: "/api/visitors/[id]/comments", method: "POST", visitorId: params.id })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
