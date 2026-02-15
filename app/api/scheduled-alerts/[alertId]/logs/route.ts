import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ alertId: string }> }) {
  try {
    const { alertId } = await params
    const supabase = await createServerClient()

    const { data: logs, error } = await supabase
      .from("alert_logs")
      .select("*")
      .eq("alert_id", alertId)
      .order("executed_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error("[v0] Error fetching alert logs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
