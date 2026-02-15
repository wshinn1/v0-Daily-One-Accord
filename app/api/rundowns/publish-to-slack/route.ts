import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError, ExternalAPIError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { rundownId, channelId } = await request.json()

  if (!rundownId || !channelId) {
    throw new ValidationError("Rundown ID and channel ID are required")
  }

  // Get the rundown details
  const { data: rundown, error: rundownError } = await supabase
    .from("event_rundowns")
    .select("*, created_by_user:created_by(full_name)")
    .eq("id", rundownId)
    .single()

  if (rundownError) {
    throw new DatabaseError("Failed to fetch rundown", { cause: rundownError })
  }

  if (!rundown) {
    throw new ValidationError("Rundown not found")
  }

  // Get all modules for this rundown
  const { data: modules } = await supabase
    .from("rundown_modules")
    .select("*, assigned_user:assigned_to(full_name)")
    .eq("rundown_id", rundownId)
    .order("order_index")

  const { data: teamAssignments } = await supabase
    .from("rundown_team_assignments")
    .select(`
      id,
      service_team_categories(name),
      users(full_name)
    `)
    .eq("rundown_id", rundownId)

  const { data: worshipSongs } = await supabase
    .from("rundown_worship_songs")
    .select("*")
    .eq("rundown_id", rundownId)
    .order("order_index")

  // Get Slack bot token
  const { data: churchTenant, error: tenantError } = await supabase
    .from("church_tenants")
    .select("slack_bot_token")
    .eq("id", rundown.church_tenant_id)
    .single()

  if (tenantError) {
    throw new DatabaseError("Failed to fetch church tenant", { cause: tenantError })
  }

  if (!churchTenant?.slack_bot_token) {
    throw new ValidationError("Slack not configured for this church")
  }

  const targetChannelId = channelId

  // Format the rundown message
  const eventDate = new Date(rundown.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let message = `*${rundown.title}*\n`
  message += `📅 ${eventDate}\n`
  if (rundown.description) {
    message += `${rundown.description}\n`
  }

  if (worshipSongs && worshipSongs.length > 0) {
    message += `\n*🎵 Worship Songs:*\n`
    worshipSongs.forEach((song: any, index: number) => {
      message += `${index + 1}. *${song.title}*`
      if (song.artist) message += ` - ${song.artist}`
      if (song.key) message += ` (Key: ${song.key})`
      if (song.tempo) message += ` [${song.tempo}]`
      message += `\n`
      if (song.notes) message += `   _${song.notes}_\n`
    })
  }

  if (teamAssignments && teamAssignments.length > 0) {
    message += `\n*👥 Service Team Assignments:*\n`

    // Group by category
    const groupedTeams: { [key: string]: string[] } = {}
    teamAssignments.forEach((assignment: any) => {
      const categoryName = assignment.service_team_categories?.name || "Other"
      const userName = assignment.users?.full_name || "Unknown"
      if (!groupedTeams[categoryName]) {
        groupedTeams[categoryName] = []
      }
      groupedTeams[categoryName].push(userName)
    })

    Object.entries(groupedTeams).forEach(([category, members]) => {
      message += `*${category}:* ${members.join(", ")}\n`
    })
  }

  message += `\n*📋 Event Schedule:*\n`

  if (modules && modules.length > 0) {
    modules.forEach((module, index) => {
      message += `\n${index + 1}. *${module.title}*`
      if (module.start_time) {
        message += ` - ${module.start_time}`
      }
      if (module.duration_minutes) {
        message += ` (${module.duration_minutes} min)`
      }
      if (module.assigned_user) {
        message += `\n   👤 ${module.assigned_user.full_name}`
      }
      if (module.description) {
        message += `\n   ${module.description}`
      }
      if (module.notes) {
        message += `\n   📝 ${module.notes}`
      }
    })
  } else {
    message += "\nNo modules added yet."
  }

  // Send message to Slack
  const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${churchTenant.slack_bot_token}`,
    },
    body: JSON.stringify({
      channel: targetChannelId,
      text: message,
      mrkdwn: true,
    }),
  })

  const slackData = await slackResponse.json()

  if (!slackData.ok) {
    throw new ExternalAPIError(`Slack API error: ${slackData.error}`, "Slack")
  }

  // Update rundown to mark as published
  const { error: updateError } = await supabase
    .from("event_rundowns")
    .update({
      is_published: true,
    })
    .eq("id", rundownId)

  if (updateError) {
    throw new DatabaseError("Failed to update rundown publish status", { cause: updateError })
  }

  return NextResponse.json({ success: true, channelId: targetChannelId })
})
