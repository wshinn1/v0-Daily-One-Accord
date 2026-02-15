import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: categories, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("[v0] Error fetching blog categories:", error)
    return NextResponse.json({ error: "Failed to fetch blog categories" }, { status: 500 })
  }
}
