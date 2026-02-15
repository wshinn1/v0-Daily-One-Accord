import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import QRCode from "qrcode"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No church tenant found" }, { status: 400 })
    }

    const body = await request.json()

    const {
      name,
      description,
      category,
      teacher_id,
      location,
      schedule_day,
      schedule_time,
      start_date,
      end_date,
      max_capacity,
      age_group,
      is_active,
      add_to_calendar,
      is_recurring,
      recurrence_days,
    } = body

    // Create class first
    const { data: newClass, error: classError } = await supabase
      .from("classes")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        description: description || null,
        category: category || null,
        teacher_id: teacher_id || null,
        location: location || null,
        schedule_day: schedule_day || null,
        schedule_time: schedule_time || null,
        start_date: start_date || null,
        end_date: end_date || null,
        max_capacity: max_capacity ? Number.parseInt(max_capacity) : null,
        age_group: age_group || null,
        is_active: is_active !== undefined ? is_active : true,
        is_recurring: is_recurring || false,
        recurrence_days: recurrence_days || null,
      })
      .select()
      .single()

    if (classError) {
      console.error("[v0] Class creation error:", classError)
      return NextResponse.json({ error: "Failed to create class", details: classError.message }, { status: 500 })
    }

    // Generate QR code
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyoneaccord.com"
      const registrationUrl = `${siteUrl}/register/class/${newClass.id}`

      // Generate QR code as buffer
      const qrCodeBuffer = await QRCode.toBuffer(registrationUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Upload to Vercel Blob
      const blob = await put(`qr-codes/class-${newClass.id}.png`, qrCodeBuffer, {
        access: "public",
        contentType: "image/png",
      })

      // Update class with QR code URL
      const { error: updateError } = await supabase
        .from("classes")
        .update({ qr_code_url: blob.url })
        .eq("id", newClass.id)

      if (updateError) {
        console.error("[v0] Failed to update class with QR code URL:", updateError)
      } else {
        newClass.qr_code_url = blob.url
      }
    } catch (qrError) {
      console.error("[v0] Failed to generate QR code:", qrError)
      // Don't fail the entire request if QR generation fails
    }

    // Add to calendar if requested
    if (add_to_calendar && schedule_time && start_date) {
      try {
        const recurrencePattern =
          is_recurring && recurrence_days?.length > 0 ? recurrence_days.join(", ") : schedule_day

        const { error: calendarError } = await supabase.from("events").insert({
          church_tenant_id: userData.church_tenant_id,
          title: name,
          description: description || `Class: ${name}`,
          start_time: `${start_date}T${schedule_time}:00`,
          end_time: end_date ? `${end_date}T${schedule_time}:00` : `${start_date}T${schedule_time}:00`,
          location: location || null,
          event_type: "class",
          is_recurring: is_recurring || false,
          recurrence_pattern: recurrencePattern || null,
        })

        if (calendarError) {
          console.error("[v0] Calendar event creation error:", calendarError)
        }
      } catch (calendarError) {
        console.error("[v0] Failed to add class to calendar:", calendarError)
      }
    }

    return NextResponse.json(newClass)
  } catch (error) {
    console.error("[v0] Class creation error:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}
