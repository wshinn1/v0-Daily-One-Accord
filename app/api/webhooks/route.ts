import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 })
    }

    const { data: webhooks, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("church_tenant_id", userData.church_tenant_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching webhooks:", error)
      return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
    }

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("[v0] Webhooks fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
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

    const { data: userData } = await supabase.from("users").select("church_tenant_id, role").eq("id", user.id).single()

    if (!userData?.church_tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 403 })
    }

    // Check if user has permission
    if (!["admin", "pastor", "elder"].includes(userData.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { name, url, events } = await request.json()

    // Generate a secure secret
    const secret = crypto.randomBytes(32).toString("hex")

    const { data: webhook, error } = await supabase
      .from("webhooks")
      .insert({
        church_tenant_id: userData.church_tenant_id,
        name,
        url,
        events,
        secret,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating webhook:", error)
      return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
    }

    return NextResponse.json(webhook)
  } catch (error) {
    console.error("[v0] Webhook creation error:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}
