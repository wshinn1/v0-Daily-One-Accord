import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client with service role privileges
 * This bypasses Row Level Security (RLS) policies
 * ONLY use this for trusted server-side operations like cron jobs
 */
export function getSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
