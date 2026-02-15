import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { sanitizeTenantId } from "@/lib/utils/tenant"

export default async function SlackDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("church_tenant_id, is_super_admin")
    .eq("id", user.id)
    .single()

  const cleanTenantParam = sanitizeTenantId(params.tenant)
  const tenantId = userData?.is_super_admin && cleanTenantParam ? cleanTenantParam : userData?.church_tenant_id

  if (!tenantId) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Slack Configuration Debug</h1>
        <div className="border border-yellow-500 rounded-lg p-4 bg-yellow-50">
          <p className="font-semibold mb-2">No tenant ID found</p>
          <p className="mb-4">As a super admin, you need to access this page with a tenant parameter.</p>
          <p className="mb-2">
            Add <code className="bg-white px-2 py-1 rounded">?tenant=YOUR_TENANT_ID</code> to the URL.
          </p>
          <p className="text-sm text-muted-foreground">
            Example:{" "}
            <code className="bg-white px-2 py-1 rounded">
              /dashboard/slack-debug?tenant=caebe310-165b-48c6-912d-2088e5d60187
            </code>
          </p>
        </div>
      </div>
    )
  }

  // Get all bot configs for this tenant
  const { data: botConfigs } = await supabase.from("slack_bot_configs").select("*").eq("church_tenant_id", tenantId)

  // Get all workspaces for this tenant
  const { data: workspaces } = await supabase.from("slack_workspaces").select("*").eq("church_tenant_id", tenantId)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Slack Configuration Debug</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Current Tenant ID:</h2>
          <code className="bg-muted p-2 rounded block">{tenantId}</code>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Expected Team ID (from Slack command):</h2>
          <code className="bg-muted p-2 rounded block">T09LPQJR1M0</code>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Bot Configs in Database ({botConfigs?.length || 0}):</h2>
          {botConfigs && botConfigs.length > 0 ? (
            <div className="space-y-2">
              {botConfigs.map((config) => (
                <div key={config.id} className="bg-muted p-3 rounded">
                  <div>
                    <strong>Team ID:</strong> {config.team_id}
                  </div>
                  <div>
                    <strong>Team Name:</strong> {config.team_name}
                  </div>
                  <div>
                    <strong>Bot Token:</strong> {config.bot_token ? "✓ Set" : "✗ Missing"}
                  </div>
                  <div>
                    <strong>Signing Secret:</strong> {config.signing_secret ? "✓ Set" : "✗ Missing"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No bot configs found for this tenant</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Slack Workspaces ({workspaces?.length || 0}):</h2>
          {workspaces && workspaces.length > 0 ? (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="bg-muted p-3 rounded">
                  <div>
                    <strong>Team ID:</strong> {workspace.team_id}
                  </div>
                  <div>
                    <strong>Team Name:</strong> {workspace.team_name}
                  </div>
                  <div>
                    <strong>Access Token:</strong> {workspace.access_token ? "✓ Set" : "✗ Missing"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No workspaces found for this tenant</p>
          )}
        </div>

        <div className="border border-yellow-500 rounded-lg p-4 bg-yellow-50">
          <h2 className="font-semibold mb-2">Fix Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>If you see a bot config above with a DIFFERENT Team ID than T09LPQJR1M0, you need to update it</li>
            <li>If you see NO bot configs, you need to create one with Team ID: T09LPQJR1M0</li>
            <li>Go to Settings → Slack Configuration</li>
            <li>
              Enter the correct Team ID: <code>T09LPQJR1M0</code>
            </li>
            <li>Save your bot token and signing secret</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
