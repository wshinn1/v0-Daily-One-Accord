import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRole } from "@/lib/supabase/service-role"

// GET - Fetch Slack configuration for a tenant
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")

    console.log("[v0] 🔍 Slack config API - GET request for tenant:", tenantId)

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] ❌ No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] 👤 User ID:", user.id)

    const supabaseAdmin = getSupabaseServiceRole()
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from("users")
      .select("role, is_super_admin, church_tenant_id")
      .eq("id", user.id)
      .maybeSingle()

    console.log("[v0] 📊 User data:", {
      role: userData?.role,
      is_super_admin: userData?.is_super_admin,
      church_tenant_id: userData?.church_tenant_id,
    })

    if (userDataError || !userData) {
      console.log("[v0] ❌ User data not found:", userDataError?.message)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has access to this tenant
    const hasAccess =
      userData.is_super_admin ||
      userData.church_tenant_id === tenantId ||
      ["admin", "lead_admin", "staff"].includes(userData.role)

    console.log("[v0] 🔐 Access check:", { hasAccess, tenantId, userTenantId: userData.church_tenant_id })

    if (!hasAccess) {
      console.log("[v0] ❌ Access denied")
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { data: slackConfig, error: slackError } = await supabaseAdmin
      .from("slack_integrations")
      .select("*")
      .eq("church_tenant_id", tenantId)
      .maybeSingle()

    console.log("[v0] 📡 Slack config query result:", {
      found: !!slackConfig,
      is_active: slackConfig?.is_active,
      error: slackError?.message,
    })

    if (slackError) {
      console.error("[v0] ❌ Database error:", slackError)
      return NextResponse.json({ error: slackError.message }, { status: 500 })
    }

    console.log("[v0] ✅ Slack config fetched successfully")
    return NextResponse.json({ data: slackConfig })
  } catch (error: any) {
    console.error("[v0] ❌ Unexpected error in GET /api/slack/config:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// POST - Save/Update Slack configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { church_tenant_id, webhook_url, bot_token, is_active, workspace_id } = body

    console.log("[v0] 💾 Slack config API - POST request for tenant:", church_tenant_id)

    if (!church_tenant_id || !webhook_url || !bot_token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseServiceRole()
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role, is_super_admin, church_tenant_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has access to this tenant
    const hasAccess =
      userData.is_super_admin ||
      userData.church_tenant_id === church_tenant_id ||
      ["admin", "lead_admin", "staff"].includes(userData.role)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if config exists
    const { data: existingConfig } = await supabaseAdmin
      .from("slack_integrations")
      .select("id")
      .eq("church_tenant_id", church_tenant_id)
      .maybeSingle()

    const configData = {
      church_tenant_id,
      webhook_url,
      bot_token,
      is_active: is_active ?? true,
      workspace_id: workspace_id || "manual",
    }

    let result
    if (existingConfig) {
      console.log("[v0] 🔄 Updating existing Slack config")
      result = await supabaseAdmin.from("slack_integrations").update(configData).eq("id", existingConfig.id).select()
    } else {
      console.log("[v0] ➕ Creating new Slack config")
      result = await supabaseAdmin.from("slack_integrations").insert(configData).select()
    }

    if (result.error) {
      console.error("[v0] ❌ Database error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Slack config saved successfully")
    return NextResponse.json({ data: result.data[0] })
  } catch (error: any) {
    console.error("[v0] ❌ Unexpected error in POST /api/slack/config:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// DELETE - Disconnect Slack
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId } = body

    console.log("[v0] 🔌 Slack config API - DELETE request for tenant:", tenantId)

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseServiceRole()
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role, is_super_admin, church_tenant_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has access to this tenant
    const hasAccess =
      userData.is_super_admin ||
      userData.church_tenant_id === tenantId ||
      ["admin", "lead_admin", "staff"].includes(userData.role)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Deactivate Slack integration
    const { error } = await supabaseAdmin
      .from("slack_integrations")
      .update({ is_active: false })
      .eq("church_tenant_id", tenantId)

    if (error) {
      console.error("[v0] ❌ Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Slack disconnected successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] ❌ Unexpected error in DELETE /api/slack/config:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
