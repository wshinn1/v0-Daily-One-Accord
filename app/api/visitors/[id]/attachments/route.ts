import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: attachments, error } = await supabase
      .from("visitor_attachments")
      .select("*, user:users(id, full_name)")
      .eq("visitor_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching attachments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error("[v0] Exception in GET /api/visitors/[id]/attachments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`visitor-attachments/${id}/${file.name}`, file, {
      access: "public",
    })

    // Save attachment record to database
    const { data: attachment, error } = await supabase
      .from("visitor_attachments")
      .insert({
        visitor_id: id,
        church_tenant_id: userData.church_tenant_id,
        user_id: user.id,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        file_type: file.type,
      })
      .select("*, user:users(id, full_name)")
      .single()

    if (error) {
      console.error("[v0] Error creating attachment record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Exception in POST /api/visitors/[id]/attachments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
