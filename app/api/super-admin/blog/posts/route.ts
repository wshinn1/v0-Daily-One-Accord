import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

    // Get all blog posts with category info
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        category:blog_categories(id, name, slug)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("[v0] Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("is_super_admin, full_name")
      .eq("id", user.id)
      .single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      category_id,
      status,
      is_featured,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      twitter_card_type,
      read_time_minutes,
    } = body

    let keywordsArray: string[] = []
    if (meta_keywords) {
      keywordsArray = Array.isArray(meta_keywords)
        ? meta_keywords
        : meta_keywords
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean)
    }

    // Create blog post
    const { data: post, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featured_image_url: featured_image_url || null,
        category_id: category_id || null,
        author_id: user.id,
        author_name: userData.full_name || user.email,
        status: status || "draft",
        is_featured: is_featured || false,
        published_at: status === "published" ? new Date().toISOString() : null,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        meta_keywords: keywordsArray.length > 0 ? keywordsArray : null,
        og_title: og_title || null,
        og_description: og_description || null,
        og_image: og_image || null,
        twitter_card_type: twitter_card_type || "summary_large_image",
        read_time_minutes: read_time_minutes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error creating blog post:", error)
      throw error
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("[v0] Error creating blog post:", error)
    return NextResponse.json(
      {
        error: "Failed to create blog post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
