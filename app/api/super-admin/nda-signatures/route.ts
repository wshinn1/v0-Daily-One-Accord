import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all NDA signatures
    const { data: signatures, error } = await supabase
      .from("nda_signatures")
      .select("*")
      .order("signed_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching NDA signatures:", error)
      return NextResponse.json({ error: "Failed to fetch signatures" }, { status: 500 })
    }

    return NextResponse.json({ signatures })
  } catch (error) {
    console.error("[v0] Error in NDA signatures API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
