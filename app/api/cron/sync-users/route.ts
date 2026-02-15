// This endpoint syncs users to church_members table automatically
// See OPTIONAL_FEATURES.md for setup instructions

/*
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { AuthenticationError, DatabaseError } from "@/lib/errors/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes max execution time

export const GET = asyncHandler(async (request: Request) => {
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      throw new AuthenticationError("Invalid cron secret")
    }
  } else {
    console.warn("[v0] CRON_SECRET not set - cron endpoint is unprotected")
  }

  const supabase = await createServerClient()
  const syncResults = []

  // Get all church tenants
  const { data: tenants, error: tenantsError } = await supabase.from("church_tenants").select("id, name")

  if (tenantsError) {
    throw new DatabaseError("Failed to fetch church tenants", { originalError: tenantsError })
  }

  console.log(`[v0] Starting user sync for ${tenants?.length || 0} church tenants`)

  // Sync users for each tenant
  for (const tenant of tenants || []) {
    try {
      // Find users in this tenant missing from church_members
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, role, created_at")
        .eq("church_tenant_id", tenant.id)
        .eq("is_super_admin", false)

      if (usersError) {
        console.error(`[v0] Error fetching users for tenant ${tenant.id}:`, usersError)
        continue
      }

      // Check which users are missing from church_members
      const usersToSync = []
      for (const user of users || []) {
        const { data: existing } = await supabase
          .from("church_members")
          .select("id")
          .eq("user_id", user.id)
          .eq("church_tenant_id", tenant.id)
          .maybeSingle()

        if (!existing) {
          usersToSync.push(user)
        }
      }

      // Create missing church_members records
      if (usersToSync.length > 0) {
        const membersToInsert = usersToSync.map((user) => ({
          user_id: user.id,
          church_tenant_id: tenant.id,
          role: user.role,
          joined_at: user.created_at,
        }))

        const { error: insertError } = await supabase.from("church_members").insert(membersToInsert)

        if (insertError) {
          console.error(`[v0] Error syncing users for tenant ${tenant.id}:`, insertError)
          syncResults.push({
            tenant: tenant.name,
            success: false,
            error: insertError.message,
          })
        } else {
          console.log(`[v0] Synced ${usersToSync.length} users for tenant ${tenant.name}`)
          syncResults.push({
            tenant: tenant.name,
            success: true,
            synced: usersToSync.length,
          })
        }
      } else {
        syncResults.push({
          tenant: tenant.name,
          success: true,
          synced: 0,
        })
      }
    } catch (error: any) {
      console.error(`[v0] Error processing tenant ${tenant.id}:`, error)
      syncResults.push({
        tenant: tenant.name,
        success: false,
        error: error.message,
      })
    }
  }

  const totalSynced = syncResults.reduce((sum, r) => sum + (r.synced || 0), 0)
  const successCount = syncResults.filter((r) => r.success).length

  console.log(
    `[v0] User sync complete: ${totalSynced} users synced across ${successCount}/${tenants?.length || 0} tenants`,
  )

  return NextResponse.json({
    message: "User sync completed",
    totalSynced,
    tenantsProcessed: tenants?.length || 0,
    successfulTenants: successCount,
    results: syncResults,
  })
})
*/

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Cron endpoint is currently disabled",
    note: "See OPTIONAL_FEATURES.md to enable this feature",
  })
}
