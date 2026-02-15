import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { asyncHandler } from "@/lib/errors/handler"
import { ValidationError, DatabaseError, ExternalAPIError } from "@/lib/errors/types"

const resend = new Resend(process.env.RESEND_API_KEY)

export const POST = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const { rundownId, recipients, subject, message } = await request.json()

  if (!rundownId || !recipients || !subject) {
    throw new ValidationError("Missing required fields: rundownId, recipients, or subject")
  }

  // Get the rundown details
  const { data: rundown, error: rundownError } = await supabase
    .from("event_rundowns")
    .select("*, church_tenants(name)")
    .eq("id", rundownId)
    .single()

  if (rundownError || !rundown) {
    throw new DatabaseError("Rundown not found", { originalError: rundownError })
  }

  // Get all modules
  const { data: modules } = await supabase
    .from("rundown_modules")
    .select("*, assigned_user:assigned_to(full_name)")
    .eq("rundown_id", rundownId)
    .order("order_index")

  // Get team assignments
  const { data: teamAssignments } = await supabase
    .from("rundown_team_assignments")
    .select(`
      id,
      service_team_categories(name),
      users(full_name)
    `)
    .eq("rundown_id", rundownId)

  // Get worship songs
  const { data: worshipSongs } = await supabase
    .from("rundown_worship_songs")
    .select("*")
    .eq("rundown_id", rundownId)
    .order("order_index")

  // Build HTML email
  const formattedDate = new Date(rundown.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  let htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: bold; }
          .song-item { margin-bottom: 12px; padding: 12px; background: white; border-radius: 4px; }
          .team-category { margin-bottom: 8px; }
          .team-category strong { color: #8b5cf6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${rundown.title}</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">${formattedDate}</p>
            ${rundown.church_tenants?.name ? `<p style="margin: 4px 0 0 0; opacity: 0.9;">${rundown.church_tenants.name}</p>` : ""}
          </div>
          <div class="content">
            ${message ? `<div class="section"><p>${message}</p></div>` : ""}
            ${rundown.description ? `<div class="section"><p>${rundown.description}</p></div>` : ""}
  `

  // Add worship songs
  if (worshipSongs && worshipSongs.length > 0) {
    htmlContent += `
      <div class="section">
        <div class="section-title">Worship Songs</div>
    `
    worshipSongs.forEach((song: any, index: number) => {
      htmlContent += `
        <div class="song-item">
          <strong>${index + 1}. ${song.title}</strong>
          ${song.artist ? `<br><span style="color: #6b7280;">Artist: ${song.artist}</span>` : ""}
          ${song.key ? `<br><span style="color: #6b7280;">Key: ${song.key}</span>` : ""}
          ${song.tempo ? `<br><span style="color: #6b7280;">Tempo: ${song.tempo}</span>` : ""}
          ${song.notes ? `<br><span style="color: #6b7280; font-style: italic;">${song.notes}</span>` : ""}
        </div>
      `
    })
    htmlContent += `</div>`
  }

  // Add team assignments
  if (teamAssignments && teamAssignments.length > 0) {
    htmlContent += `
      <div class="section">
        <div class="section-title">Service Team Assignments</div>
    `
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
      htmlContent += `
        <div class="team-category">
          <strong>${category}:</strong> ${members.join(", ")}
        </div>
      `
    })
    htmlContent += `</div>`
  }

  // Add modules table
  if (modules && modules.length > 0) {
    htmlContent += `
      <div class="section">
        <div class="section-title">Rundown Schedule</div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Module</th>
              <th>Assigned To</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
    `
    modules.forEach((module: any) => {
      htmlContent += `
        <tr>
          <td>${module.start_time || "-"}</td>
          <td>
            <strong>${module.title}</strong>
            ${module.notes ? `<br><span style="color: #6b7280; font-size: 14px;">${module.notes}</span>` : ""}
          </td>
          <td>${module.assigned_user?.full_name || "Unassigned"}</td>
          <td>${module.duration_minutes ? `${module.duration_minutes} min` : "-"}</td>
        </tr>
      `
    })
    htmlContent += `
          </tbody>
        </table>
      </div>
    `
  }

  htmlContent += `
          </div>
        </div>
      </body>
    </html>
  `

  // Send email using Resend
  const { data, error } = await resend.emails.send({
    from: "Church Management <onboarding@resend.dev>",
    to: recipients,
    subject,
    html: htmlContent,
  })

  if (error) {
    throw new ExternalAPIError("Failed to send email", {
      service: "Resend",
      originalError: error,
    })
  }

  return NextResponse.json({ success: true, emailId: data?.id })
})
