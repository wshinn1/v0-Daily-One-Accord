import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, is_completed, position } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (position !== undefined) updateData.position = position

    if (is_completed !== undefined) {
      updateData.is_completed = is_completed
      if (is_completed) {
        updateData.completed_at = new Date().toISOString()
        updateData.completed_by = user.id
      } else {
        updateData.completed_at = null
        updateData.completed_by = null
      }
    }

    const { data: item, error } = await supabase
      .from("visitor_checklist_items")
      .update(updateData)
      .eq("id", itemId)
      .select(
        `
        *,
        completed_by_user:users!visitor_checklist_items_completed_by_fkey(id, full_name)
      `,
      )
      .single()

    if (error) throw error

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error("[v0] Error updating checklist item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const { itemId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("visitor_checklist_items").delete().eq("id", itemId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting checklist item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
