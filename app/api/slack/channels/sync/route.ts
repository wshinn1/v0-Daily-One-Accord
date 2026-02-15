import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🔵 SYNC API: Starting channel sync request")

    const { slackIntegrationId, channels } = await request.json()
    console.log("[v0] 🔵 SYNC API: Received data:", {
      slackIntegrationId,
      channelCount: channels?.length || 0,
    })

    if (!slackIntegrationId || !channels) {
      console.log("[v0] 🔴 SYNC API: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] 🔵 SYNC API: Creating service role client...")
    const supabase = createServiceRoleClient()
    console.log("[v0] 🟢 SYNC API: Service role client created successfully")

    // Get existing channels
    console.log("[v0] 🔵 SYNC API: Fetching existing channels from database...")
    const { data: existingChannels, error: fetchError } = await supabase
      .from("slack_channels")
      .select("channel_id")
      .eq("slack_integration_id", slackIntegrationId)

    if (fetchError) {
      console.log("[v0] 🔴 SYNC API: Error fetching existing channels:", fetchError)
      return NextResponse.json({ error: "Failed to fetch existing channels" }, { status: 500 })
    }

    console.log("[v0] 🟢 SYNC API: Found", existingChannels?.length || 0, "existing channels")

    const existingChannelIds = new Set(existingChannels?.map((c) => c.channel_id) || [])

    // Insert new channels
    const newChannels = channels.filter((channel: any) => !existingChannelIds.has(channel.id))
    console.log("[v0] 🔵 SYNC API: Identified", newChannels.length, "new channels to insert")

    if (newChannels.length > 0) {
      const channelsToInsert = newChannels.map((channel: any) => ({
        slack_integration_id: slackIntegrationId,
        channel_name: channel.name,
        channel_id: channel.id,
      }))

      console.log("[v0] 🔵 SYNC API: Inserting channels:", channelsToInsert)

      const { error: insertError } = await supabase.from("slack_channels").insert(channelsToInsert)

      if (insertError) {
        console.error("[v0] 🔴 SYNC API: Error inserting channels:", insertError)
        return NextResponse.json({ error: "Failed to save channels" }, { status: 500 })
      }

      console.log("[v0] 🟢 SYNC API: Successfully inserted", newChannels.length, "channels")
    } else {
      console.log("[v0] 🟡 SYNC API: No new channels to insert (all already exist)")
    }

    const result = {
      success: true,
      synced: newChannels.length,
      total: channels.length,
    }

    console.log("[v0] 🟢 SYNC API: Sync completed successfully:", result)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] 🔴 SYNC API: Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Failed to sync channels" }, { status: 500 })
  }
}
