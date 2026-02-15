import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MediaAssetsView } from "@/components/media/media-assets-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"

export default async function MediaAssetsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>No user found. Please log in again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (!userData) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>User Data Error</AlertTitle>
          <AlertDescription>
            Could not load user data. Error: {userError?.message || "Unknown error"}
            <br />
            User ID: {user.id}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (userData.is_super_admin) {
    redirect("/super-admin/media-assets")
  }

  if (!userData.church_tenant_id) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Tenant Association</AlertTitle>
          <AlertDescription>
            Your account is not associated with a church tenant. Please contact your administrator.
            <br />
            User ID: {user.id}
            <br />
            Email: {user.email}
            <br />
            church_tenant_id: {userData.church_tenant_id || "null"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { data: tenantData, error: tenantError } = await supabase
    .from("church_tenants")
    .select("id, name, google_drive_url")
    .eq("id", userData.church_tenant_id)
    .maybeSingle()

  if (!tenantData) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tenant Data Error</AlertTitle>
          <AlertDescription>
            Could not load church tenant data. Error: {tenantError?.message || "Unknown error"}
            <br />
            Tenant ID: {userData.church_tenant_id}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const displayUser = {
    ...userData,
    church_tenants: tenantData,
  }

  return (
    <DashboardLayout user={displayUser} tenantId={userData.church_tenant_id}>
      <MediaAssetsView googleDriveUrl={tenantData.google_drive_url} />
    </DashboardLayout>
  )
}
