import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; reminderId: string }> },
) {
  try {
    const { reminderId } = await params
    const supabase = await createServerClient()

    const { error } = await supabase.from("reminders").delete().eq("id", reminderId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting reminder:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
