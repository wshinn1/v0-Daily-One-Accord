import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get("featured")

    let query = supabase
      .from("blog_posts")
      .select(
        `
        *,
        category:blog_categories(id, name, slug)
      `,
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (featured === "true") {
      query = query.eq("is_featured", true).limit(1)
    }

    const { data: posts, error } = await query

    if (error) throw error

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("[v0] Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
