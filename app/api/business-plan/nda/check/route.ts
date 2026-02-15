import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ signed: false, authenticated: false })
    }

    const { data: ndaSignature } = await supabase
      .from("nda_signatures")
      .select("id, signed_at")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      signed: !!ndaSignature,
      authenticated: true,
      signedAt: ndaSignature?.signed_at,
    })
  } catch (error) {
    console.error("[v0] Error checking NDA status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
