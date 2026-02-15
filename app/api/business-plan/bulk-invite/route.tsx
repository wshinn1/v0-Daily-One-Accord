import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"
import { Resend } from "resend"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"
import { generateSecurePassword } from "@/lib/password-validation"
import { createAuditLog } from "@/lib/audit-log"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BulkInviteUser {
  email: string
  full_name: string
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, rateLimiters.invitations)
  if (rateLimitResult instanceof Response) {
    return rateLimitResult
  }

  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { users: usersToInvite } = await request.json()

    if (!Array.isArray(usersToInvite) || usersToInvite.length === 0) {
      return NextResponse.json({ error: "Users array is required" }, { status: 400 })
    }

    if (usersToInvite.length > 50) {
      return NextResponse.json({ error: "Maximum 50 users per bulk invite" }, { status: 400 })
    }

    const adminClient = getSupabaseServiceRoleClient()
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    }

    const { data: tenants } = await adminClient.from("church_tenants").select("id").limit(1).single()

    if (!tenants) {
      return NextResponse.json({ error: "System configuration error" }, { status: 500 })
    }

    for (const inviteUser of usersToInvite) {
      try {
        const { email, full_name } = inviteUser

        if (!email || !full_name) {
          results.failed.push({ email: email || "unknown", error: "Email and full name are required" })
          continue
        }

        const { data: existingAuthUser } = await adminClient.auth.admin.listUsers()
        const foundUser = existingAuthUser?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

        if (foundUser) {
          const newPassword = generateSecurePassword(16)

          await adminClient.auth.admin.updateUserById(foundUser.id, {
            password: newPassword,
          })

          await adminClient
            .from("users")
            .update({
              has_business_plan_access: true,
              business_plan_invited_at: new Date().toISOString(),
              business_plan_invited_by: user.id,
            })
            .eq("id", foundUser.id)

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
            to: email,
            subject: "Daily One Accord Business Plan Access Granted",
            html: `
              <h2>You've been granted access to the Daily One Accord Business Plan</h2>
              <p>Hello ${full_name},</p>
              <p>You've been granted access to view the confidential Daily One Accord business plan.</p>
              <p><strong>Your login credentials:</strong></p>
              <p>Email: ${email}<br>
              Password: <code>${newPassword}</code></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/business-plan/login">Click here to access the business plan</a></p>
            `,
          })

          results.success.push(email)
        } else {
          const password = generateSecurePassword(16)

          const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: { full_name },
          })

          if (authError || !newUser.user) {
            results.failed.push({ email, error: authError?.message || "Failed to create user" })
            continue
          }

          await adminClient.from("users").upsert(
            {
              id: newUser.user.id,
              email: email.toLowerCase(),
              full_name,
              church_tenant_id: tenants.id,
              role: "member",
              has_business_plan_access: true,
              business_plan_invited_at: new Date().toISOString(),
              business_plan_invited_by: user.id,
              is_super_admin: false,
            },
            { onConflict: "id" },
          )

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
            to: email,
            subject: "Daily One Accord Business Plan Access",
            html: `
              <h2>You've been granted access to the Daily One Accord Business Plan</h2>
              <p>Hello ${full_name},</p>
              <p>You have been invited to view the confidential Daily One Accord business plan.</p>
              <p><strong>Your login credentials:</strong></p>
              <p>Email: ${email}<br>
              Password: <code>${password}</code></p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/business-plan/login">Click here to login</a></p>
            `,
          })

          results.success.push(email)
        }
      } catch (error) {
        console.error(`[v0] Error inviting ${inviteUser.email}:`, error)
        results.failed.push({
          email: inviteUser.email,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    await createAuditLog({
      action: "user.invited",
      resourceType: "business_plan_access",
      details: {
        bulkInvite: true,
        totalUsers: usersToInvite.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: usersToInvite.length,
        succeeded: results.success.length,
        failed: results.failed.length,
      },
    })
  } catch (error) {
    console.error("[v0] Bulk invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
