import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).maybeSingle()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const settings = await request.json()

    const { data, error } = await supabase
      .from("seo_settings")
      .upsert({
        id: settings.id || "00000000-0000-0000-0000-000000000001",
        site_title: settings.site_title,
        site_description: settings.site_description,
        site_keywords: settings.site_keywords,
        og_image_url: settings.og_image_url,
        favicon_url: settings.favicon_url,
        twitter_handle: settings.twitter_handle,
        google_analytics_id: settings.google_analytics_id,
        google_site_verification: settings.google_site_verification,
        facebook_pixel_id: settings.facebook_pixel_id,
        canonical_domain: settings.canonical_domain,
        robots_allow_indexing: settings.robots_allow_indexing,
        sitemap_enabled: settings.sitemap_enabled,
        schema_org_enabled: settings.schema_org_enabled,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error saving SEO settings:", error)
    return NextResponse.json({ error: "Failed to save SEO settings" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("seo_settings").select("*").single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching SEO settings:", error)
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 })
  }
}
