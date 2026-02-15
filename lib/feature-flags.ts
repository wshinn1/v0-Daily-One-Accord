import { createClient } from "@/lib/supabase/server"

export async function isFeatureEnabled(tenantId: string, flagKey: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get the feature flag
    const { data: flag } = await supabase
      .from("feature_flags")
      .select("id, enabled_by_default")
      .eq("flag_key", flagKey)
      .single()

    if (!flag) {
      return false
    }

    // Check for tenant-specific override
    const { data: override } = await supabase
      .from("tenant_feature_flags")
      .select("enabled")
      .eq("church_tenant_id", tenantId)
      .eq("feature_flag_id", flag.id)
      .maybeSingle()

    // Return override if exists, otherwise default
    return override ? override.enabled : flag.enabled_by_default
  } catch (error) {
    console.error("[v0] Error checking feature flag:", error)
    return false
  }
}

export async function getAllFeatureFlags() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("feature_flags").select("*").order("name")

  if (error) throw error
  return data
}

export async function getTenantFeatureFlags(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("feature_flags")
    .select(`
      *,
      tenant_feature_flags!left(
        enabled,
        enabled_at,
        notes
      )
    `)
    .eq("tenant_feature_flags.church_tenant_id", tenantId)
    .order("name")

  if (error) throw error
  return data
}
