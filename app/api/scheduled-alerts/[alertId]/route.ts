import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const { alertId } = await params
    const supabase = await createServerClient()
    const body = await request.json()

    const { error } = await supabase.from("scheduled_alerts").update(body).eq("id", alertId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error updating alert:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const { alertId } = await params
    const supabase = await createServerClient()

    const { error } = await supabase.from("scheduled_alerts").delete().eq("id", alertId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting alert:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
