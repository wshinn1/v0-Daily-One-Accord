import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, churchTenantId } = await request.json()

    if (!email || !churchTenantId) {
      return NextResponse.json({ error: "Email and church tenant ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Check if user exists in auth
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("[v0] Error checking auth users:", authError)
      return NextResponse.json({ wasRemoved: false })
    }

    const authUser = users?.find((u) => u.email === email)

    if (!authUser) {
      return NextResponse.json({ wasRemoved: false })
    }

    // Check if user was removed from this church
    const { data: member, error: memberError } = await supabase
      .from("church_members")
      .select("removed_at")
      .eq("user_id", authUser.id)
      .eq("church_tenant_id", churchTenantId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ wasRemoved: false })
    }

    return NextResponse.json({
      wasRemoved: member.removed_at !== null,
      userId: authUser.id,
    })
  } catch (error) {
    console.error("[v0] Error in check-removed API:", error)
    return NextResponse.json({ wasRemoved: false })
  }
}
