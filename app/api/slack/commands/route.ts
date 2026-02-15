import { type NextRequest, NextResponse } from "next/server"
import { verifySlackRequest } from "@/lib/slack-verify"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"
import { AuthenticationError, DatabaseError, ExternalAPIError } from "@/lib/errors/handler"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ===== Slack Command Received =====")

    const body = await request.text()
    const formData = new URLSearchParams(body)
    const teamId = formData.get("team_id") as string
    const command = formData.get("command")
    const triggerId = formData.get("trigger_id") as string
    const channelId = formData.get("channel_id") as string
    const userId = formData.get("user_id") as string

    console.log("[v0] Command:", command, "Team ID:", teamId)

    const supabase = getSupabaseServiceRole()

    const { data: botConfig, error: botError } = await supabase
      .from("slack_bot_configs")
      .select("signing_secret, bot_token, bot_name")
      .eq("team_id", teamId)
      .single()

    if (botError || !botConfig) {
      console.error("[v0] Bot config not found for team:", teamId, botError)
      throw new DatabaseError(`Bot config not found for team: ${teamId}`, botError)
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("slack_workspaces")
      .select("church_tenant_id, team_name")
      .eq("team_id", teamId)
      .single()

    if (workspaceError || !workspace) {
      console.error("[v0] Workspace not linked for team:", teamId, workspaceError)
      return NextResponse.json({
        text: "⚠️ Your Slack workspace is not linked to a church. Please go to Settings → Slack Configuration to link your workspace.",
      })
    }

    const signingSecret = botConfig.signing_secret
    const botToken = botConfig.bot_token

    if (!signingSecret || !botToken) {
      console.error("[v0] ❌ Slack credentials incomplete for this bot")
      return NextResponse.json({
        text: "⚠️ Slack bot credentials are incomplete. Please contact your administrator.",
      })
    }

    const timestamp = request.headers.get("x-slack-request-timestamp")
    const signature = request.headers.get("x-slack-signature")

    if (!timestamp || !signature) {
      console.error("[v0] ❌ Missing Slack verification headers")
      return NextResponse.json({
        text: "⚠️ Authentication failed. Missing verification headers.",
      })
    }

    const isValid = verifySlackRequest(body, timestamp, signature, signingSecret)
    if (!isValid) {
      console.error("[v0] ❌ Slack signature verification failed for team:", teamId)
      throw new AuthenticationError("Slack signature verification failed")
    }

    console.log("[v0] ✅ Slack signature verified successfully")

    if (command === "/zoom") {
      // Check if Zoom is configured
      const { data: zoomConfig } = await supabase
        .from("zoom_integrations")
        .select("is_active")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .single()

      if (!zoomConfig || !zoomConfig.is_active) {
        return NextResponse.json({
          text: "⚠️ Zoom is not configured. Please go to Settings → Zoom to connect your Zoom account.",
        })
      }

      // Open modal for Zoom meeting creation
      const modalResponse = await fetch("https://slack.com/api/views.open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${botToken}`,
        },
        body: JSON.stringify({
          trigger_id: triggerId,
          view: {
            type: "modal",
            callback_id: "zoom_meeting_creation",
            title: {
              type: "plain_text",
              text: "Create Zoom Meeting",
            },
            submit: {
              type: "plain_text",
              text: "Create",
            },
            blocks: [
              {
                type: "input",
                block_id: "topic_block",
                element: {
                  type: "plain_text_input",
                  action_id: "topic_input",
                  placeholder: {
                    type: "plain_text",
                    text: "e.g., Sunday Service, Prayer Meeting",
                  },
                },
                label: {
                  type: "plain_text",
                  text: "Meeting Topic",
                },
              },
              {
                type: "input",
                block_id: "type_block",
                element: {
                  type: "static_select",
                  action_id: "type_select",
                  placeholder: {
                    type: "plain_text",
                    text: "Select meeting type",
                  },
                  options: [
                    {
                      text: { type: "plain_text", text: "Start Now (Instant)" },
                      value: "instant",
                    },
                    {
                      text: { type: "plain_text", text: "Schedule for Later" },
                      value: "scheduled",
                    },
                  ],
                  initial_option: {
                    text: { type: "plain_text", text: "Start Now (Instant)" },
                    value: "instant",
                  },
                },
                label: {
                  type: "plain_text",
                  text: "Meeting Type",
                },
              },
              {
                type: "input",
                block_id: "datetime_block",
                element: {
                  type: "datetimepicker",
                  action_id: "datetime_select",
                },
                label: {
                  type: "plain_text",
                  text: "Start Time (for scheduled meetings)",
                },
                optional: true,
              },
              {
                type: "input",
                block_id: "duration_block",
                element: {
                  type: "number_input",
                  action_id: "duration_input",
                  is_decimal_allowed: false,
                  min_value: "15",
                  initial_value: "60",
                },
                label: {
                  type: "plain_text",
                  text: "Duration (minutes)",
                },
                optional: true,
              },
              {
                type: "input",
                block_id: "post_block",
                element: {
                  type: "static_select",
                  action_id: "post_select",
                  placeholder: {
                    type: "plain_text",
                    text: "Select option",
                  },
                  options: [
                    {
                      text: { type: "plain_text", text: "Post to this channel" },
                      value: "current",
                    },
                    {
                      text: { type: "plain_text", text: "Don't post (just create)" },
                      value: "none",
                    },
                  ],
                  initial_option: {
                    text: { type: "plain_text", text: "Post to this channel" },
                    value: "current",
                  },
                },
                label: {
                  type: "plain_text",
                  text: "Post Meeting Link",
                },
              },
            ],
            private_metadata: JSON.stringify({
              channel_id: channelId,
              user_id: userId,
              church_tenant_id: workspace.church_tenant_id,
            }),
          },
        }),
      })

      const modalResult = await modalResponse.json()

      if (!modalResult.ok) {
        console.error("[v0] Failed to open Zoom modal:", modalResult)
        throw new ExternalAPIError("Failed to open Slack modal", { details: modalResult })
      }

      return new NextResponse("", { status: 200 })
    }

    if (command === "/attendance") {
      // Get recent events
      const { data: events } = await supabase
        .from("events")
        .select("id, title, start_time, event_type")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .gte("start_time", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("start_time", { ascending: false })
        .limit(10)

      if (!events || events.length === 0) {
        return NextResponse.json({
          text: "⚠️ No recent events found. Please create an event in your dashboard first at login.dailyoneaccord.com/dashboard/calendar",
        })
      }

      // Get attendance categories
      const { data: categories } = await supabase
        .from("attendance_categories")
        .select("id, name, description")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .eq("is_active", true)
        .order("display_order")

      if (!categories || categories.length === 0) {
        return NextResponse.json({
          text: "⚠️ No attendance categories found. Please set up categories in your dashboard first.",
        })
      }

      const { data: customFields } = await supabase
        .from("slack_attendance_form_fields")
        .select("*")
        .eq("church_tenant_id", workspace.church_tenant_id)
        .eq("is_active", true)
        .order("display_order")

      // Build modal blocks
      const modalBlocks: any[] = [
        {
          type: "input",
          block_id: "event_block",
          element: {
            type: "static_select",
            action_id: "event_select",
            placeholder: {
              type: "plain_text",
              text: "Select a service/event",
            },
            options: events.map((event) => ({
              text: {
                type: "plain_text",
                text: `${event.title} (${event.event_type || "service"})`,
              },
              value: event.id,
            })),
          },
          label: {
            type: "plain_text",
            text: "Service/Event",
          },
        },
        {
          type: "input",
          block_id: "date_block",
          element: {
            type: "datepicker",
            action_id: "date_select",
            initial_date: new Date().toISOString().split("T")[0],
            placeholder: {
              type: "plain_text",
              text: "Select date",
            },
          },
          label: {
            type: "plain_text",
            text: "Attendance Date",
          },
        },
      ]

      // Add category input fields
      categories.forEach((category) => {
        modalBlocks.push({
          type: "input",
          block_id: `category_${category.id}`,
          element: {
            type: "number_input",
            action_id: `count_${category.id}`,
            is_decimal_allowed: false,
            min_value: "0",
            initial_value: "0",
          },
          label: {
            type: "plain_text",
            text: category.description ? `${category.name} (${category.description})` : category.name,
          },
          optional: true,
        })
      })

      if (customFields && customFields.length > 0) {
        customFields.forEach((field) => {
          const block: any = {
            type: "input",
            block_id: `custom_${field.id}`,
            label: {
              type: "plain_text",
              text: field.field_label,
            },
            optional: !field.is_required,
          }

          // Set element based on field type
          switch (field.field_type) {
            case "text":
              block.element = {
                type: "plain_text_input",
                action_id: `custom_input_${field.id}`,
                placeholder: {
                  type: "plain_text",
                  text: `Enter ${field.field_label.toLowerCase()}...`,
                },
              }
              break
            case "number":
              block.element = {
                type: "number_input",
                action_id: `custom_input_${field.id}`,
                is_decimal_allowed: false,
              }
              break
            case "select":
              if (field.options && Array.isArray(field.options)) {
                block.element = {
                  type: "static_select",
                  action_id: `custom_input_${field.id}`,
                  options: field.options.map((opt: any) => ({
                    text: { type: "plain_text", text: opt.label },
                    value: opt.value,
                  })),
                }
              }
              break
            case "date":
              block.element = {
                type: "datepicker",
                action_id: `custom_input_${field.id}`,
              }
              break
          }

          modalBlocks.push(block)
        })
      }

      // Add notes field
      modalBlocks.push({
        type: "input",
        block_id: "notes_block",
        element: {
          type: "plain_text_input",
          action_id: "notes_input",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "Add any additional notes...",
          },
        },
        label: {
          type: "plain_text",
          text: "Notes (optional)",
        },
        optional: true,
      })

      const modalResponse = await fetch("https://slack.com/api/views.open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${botToken}`,
        },
        body: JSON.stringify({
          trigger_id: triggerId,
          view: {
            type: "modal",
            callback_id: "attendance_submission",
            title: {
              type: "plain_text",
              text: "Log Attendance",
            },
            submit: {
              type: "plain_text",
              text: "Submit",
            },
            blocks: modalBlocks,
          },
        }),
      })

      const modalResult = await modalResponse.json()

      if (!modalResult.ok) {
        console.error("[v0] Failed to open modal:", modalResult)
        throw new ExternalAPIError("Failed to open attendance form", { details: modalResult })
      }

      console.log("[v0] Modal opened successfully")

      return new NextResponse("", { status: 200 })
    }

    return NextResponse.json({ text: "Unknown command" })
  } catch (error) {
    console.error("[v0] Slack command error:", error)
    return NextResponse.json({
      text: "⚠️ An error occurred. Please try again or contact your administrator.",
    })
  }
}
