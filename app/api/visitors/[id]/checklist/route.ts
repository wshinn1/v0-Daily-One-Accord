import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: items, error } = await supabase
      .from("visitor_checklist_items")
      .select(
        `
        *,
        completed_by_user:users!visitor_checklist_items_completed_by_fkey(id, full_name)
      `,
      )
      .eq("visitor_id", id)
      .order("position")

    if (error) throw error

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error("[v0] Error fetching checklist items:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, position } = body

    const { data: item, error } = await supabase
      .from("visitor_checklist_items")
      .insert({
        visitor_id: id,
        church_tenant_id: userData.church_tenant_id,
        title,
        description,
        position: position ?? 0,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error("[v0] Error creating checklist item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
