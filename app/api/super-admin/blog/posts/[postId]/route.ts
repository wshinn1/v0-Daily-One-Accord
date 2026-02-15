import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
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

    const body = await request.json()
    const { postId } = params

    if (body.meta_keywords && !Array.isArray(body.meta_keywords)) {
      body.meta_keywords = body.meta_keywords
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean)
    }

    // If status is being changed to published, set published_at
    if (body.status === "published" && !body.published_at) {
      body.published_at = new Date().toISOString()
    }

    // Update blog post
    const { data: post, error } = await supabase.from("blog_posts").update(body).eq("id", postId).select().single()

    if (error) throw error

    return NextResponse.json({ post })
  } catch (error) {
    console.error("[v0] Error updating blog post:", error)
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
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

    const { postId } = params

    // Delete blog post
    const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting blog post:", error)
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
}
