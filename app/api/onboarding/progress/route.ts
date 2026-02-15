import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 })
    }

    const { data: progress } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .single()

    if (!progress) {
      // Create initial progress record
      const { data: newProgress } = await supabase
        .from("onboarding_progress")
        .insert({
          church_tenant_id: userData.church_tenant_id,
          completed_steps: [],
        })
        .select()
        .single()

      return NextResponse.json(newProgress || { completed_steps: [] })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("[v0] Error fetching onboarding progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 })
    }

    const body = await request.json()
    const { completed_steps, skipped } = body

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (completed_steps) {
      updates.completed_steps = completed_steps
      // Check if all steps are completed
      if (completed_steps.length === 5) {
        updates.completed_at = new Date().toISOString()
      }
    }

    if (skipped !== undefined) {
      updates.skipped = skipped
    }

    const { data, error } = await supabase
      .from("onboarding_progress")
      .update(updates)
      .eq("church_tenant_id", userData.church_tenant_id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating progress:", error)
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating onboarding progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
