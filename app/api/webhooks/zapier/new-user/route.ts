// This webhook sends new user data to Zapier for automation workflows
// See OPTIONAL_FEATURES.md for setup instructions

/*
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook endpoint for Zapier integration
// Triggers when a new user signs up
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET

    if (webhookSecret) {
      const authHeader = request.headers.get("authorization")
      if (authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } else {
      console.warn("[v0] ZAPIER_WEBHOOK_SECRET not set - webhook endpoint is unprotected")
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch user data
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        church_tenant_id,
        church_tenants (
          name,
          church_code
        )
      `,
      )
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data for Zapier
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        church_name: user.church_tenants?.name,
        church_code: user.church_tenants?.church_code,
        created_at: user.created_at,
      },
    })
  } catch (error: any) {
    console.error("[v0] Zapier webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to test webhook
export async function GET() {
  return NextResponse.json({
    message: "Zapier webhook endpoint is active",
    endpoint: "/api/webhooks/zapier/new-user",
    method: "POST",
    headers: {
      authorization: "Bearer YOUR_WEBHOOK_SECRET",
    },
    body: {
      userId: "user-id-here",
    },
  })
}
*/

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Zapier webhook endpoint is currently disabled",
    note: "See OPTIONAL_FEATURES.md to enable this feature",
  })
}

export async function POST() {
  return NextResponse.json({
    message: "Zapier webhook endpoint is currently disabled",
    note: "See OPTIONAL_FEATURES.md to enable this feature",
  })
}
