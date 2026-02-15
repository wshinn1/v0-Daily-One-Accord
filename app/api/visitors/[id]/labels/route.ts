import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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

    const { data: assignments, error } = await supabase
      .from("visitor_label_assignments")
      .select("*, label:visitor_labels(*)")
      .eq("visitor_id", id)

    if (error) {
      console.error("[v0] Error fetching visitor labels:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ labels: assignments?.map((a) => a.label) || [] })
  } catch (error) {
    console.error("[v0] Exception in GET /api/visitors/[id]/labels:", error)
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

    const body = await request.json()
    const { label_id } = body

    if (!label_id) {
      return NextResponse.json({ error: "Label ID is required" }, { status: 400 })
    }

    const { data: assignment, error } = await supabase
      .from("visitor_label_assignments")
      .insert({
        visitor_id: id,
        label_id,
      })
      .select("*, label:visitor_labels(*)")
      .single()

    if (error) {
      console.error("[v0] Error assigning label:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ label: assignment.label }, { status: 201 })
  } catch (error) {
    console.error("[v0] Exception in POST /api/visitors/[id]/labels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const labelId = searchParams.get("label_id")

    if (!labelId) {
      return NextResponse.json({ error: "Label ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("visitor_label_assignments")
      .delete()
      .eq("visitor_id", id)
      .eq("label_id", labelId)

    if (error) {
      console.error("[v0] Error removing label:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Exception in DELETE /api/visitors/[id]/labels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
