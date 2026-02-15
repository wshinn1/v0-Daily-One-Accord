import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"
import { Resend } from "resend"
import { withRateLimit, rateLimiters } from "@/lib/rate-limit"
import { generateSecurePassword } from "@/lib/password-validation"
import { createAuditLog } from "@/lib/audit-log"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const { email, full_name } = await request.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and full name are required" }, { status: 400 })
    }

    const adminClient = getSupabaseServiceRoleClient()

    if (!adminClient) {
      console.error("[v0] Service role client is undefined")
      return NextResponse.json({ error: "Service configuration error" }, { status: 500 })
    }

    if (!adminClient.auth) {
      console.error("[v0] Service role client missing auth property")
      return NextResponse.json({ error: "Service configuration error" }, { status: 500 })
    }

    console.log("[v0] Service role client created successfully")
    console.log("[v0] Service role key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    console.log("[v0] Checking if user exists with email:", email.toLowerCase())

    const { data: existingAuthUser } = await adminClient.auth.admin.listUsers()
    const foundUser = existingAuthUser?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (foundUser) {
      console.log("[v0] Found existing user:", foundUser.id, foundUser.email)

      const newPassword = generateSecurePassword(16)

      const { error: passwordError } = await adminClient.auth.admin.updateUserById(foundUser.id, {
        password: newPassword,
      })

      if (passwordError) {
        console.error("[v0] Error updating password:", passwordError)
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
      }

      console.log("[v0] Password reset successfully for existing user")

      const { error: updateError } = await adminClient
        .from("users")
        .update({
          has_business_plan_access: true,
          business_plan_invited_at: new Date().toISOString(),
          business_plan_invited_by: user.id,
        })
        .eq("id", foundUser.id)

      if (updateError) {
        console.error("[v0] Error granting business plan access:", updateError)
        return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
      }

      const { data: verifyData } = await adminClient
        .from("users")
        .select("has_business_plan_access")
        .eq("id", foundUser.id)
        .single()

      console.log("[v0] Verified has_business_plan_access:", verifyData?.has_business_plan_access)

      if (!verifyData?.has_business_plan_access) {
        console.error("[v0] WARNING: has_business_plan_access flag not set correctly!")
        return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
      }

      await createAuditLog({
        action: "user.invited",
        resourceType: "business_plan_access",
        resourceId: foundUser.id,
        details: {
          email,
          full_name,
          existingUser: true,
          passwordReset: true,
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      })

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@dailyoneaccord.com",
          to: email,
          subject: "Daily One Accord Business Plan Access Granted",
          html: `
            <h2>You've been granted access to the Daily One Accord Business Plan</h2>
            <p>Hello ${foundUser.user_metadata?.full_name || full_name},</p>
            <p>Great news! You've been granted access to view the confidential Daily One Accord business plan.</p>
            <p><strong>Your login credentials:</strong></p>
            <p>Email: ${email}<br>
            Password: <code>${newPassword}</code></p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/business-plan/login">Click here to access the business plan</a></p>
            <p><em>Note: Your password has been reset. Please keep these credentials secure.</em></p>
            <p><em>You will be required to sign an NDA before accessing the business plan.</em></p>
          `,
        })
      } catch (emailError) {
        console.error("[v0] Error sending access granted email:", emailError)
      }

      return NextResponse.json({ success: true, existingUser: true })
    }

    const { data: tenants } = await adminClient.from("church_tenants").select("id").limit(1).single()

    if (!tenants) {
      console.error("[v0] No church tenants found in database")
      return NextResponse.json({ error: "System configuration error" }, { status: 500 })
    }

    const password = generateSecurePassword(16)

    console.log("[v0] Creating new user with email:", email)

    const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (authError || !newUser.user) {
      console.error("[v0] Error creating Supabase user:", authError)
      return NextResponse.json({ error: authError?.message || "Failed to create user account" }, { status: 500 })
    }

    console.log("[v0] User created successfully in auth:", newUser.user.id)

    const { error: insertError } = await adminClient.from("users").upsert(
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
      {
        onConflict: "id",
      },
    )

    if (insertError) {
      console.error("[v0] Error creating user record:", insertError)
      console.error("[v0] Insert error details:", JSON.stringify(insertError, null, 2))
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: "Failed to create user record" }, { status: 500 })
    }

    console.log("[v0] User record created successfully in database")

    const { data: verifyData } = await adminClient
      .from("users")
      .select("has_business_plan_access, email, full_name")
      .eq("id", newUser.user.id)
      .single()

    console.log("[v0] Verified user record:", verifyData)

    if (!verifyData?.has_business_plan_access) {
      console.error("[v0] WARNING: has_business_plan_access flag not set correctly!")
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
    }

    await createAuditLog({
      action: "user.created",
      resourceType: "business_plan_access",
      resourceId: newUser.user.id,
      details: {
        email,
        full_name,
        existingUser: false,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    try {
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
          <p>Please keep these credentials secure and do not share them with anyone.</p>
          <p><em>Note: You will be required to sign an NDA before accessing the business plan.</em></p>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Error sending invitation email:", emailError)
    }

    return NextResponse.json({ success: true, existingUser: false })
  } catch (error) {
    console.error("[v0] Business plan invitation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
