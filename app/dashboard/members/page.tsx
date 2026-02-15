import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { MemberList } from "@/components/members/member-list"
import { CSVImportDialog } from "@/components/members/csv-import-dialog"
import { GroupsManager } from "@/components/members/groups-manager"
import { Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function MembersPage() {
  console.log("[v0] Members page rendering...")
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User fetched:", user?.id)

  if (!user) {
    console.log("[v0] No user, redirecting to login")
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, church_tenant_id, role")
    .eq("id", user.id)
    .single()

  console.log("[v0] User data fetched:", { id: userData?.id, church_tenant_id: userData?.church_tenant_id })

  if (!userData || !userData.church_tenant_id) {
    console.log("[v0] No user data or church_tenant_id, redirecting to login")
    redirect("/login")
  }

  const { data: tenantData } = await supabase
    .from("church_tenants")
    .select("*")
    .eq("id", userData.church_tenant_id)
    .single()

  const tenantTheme = {
    logo_url: tenantData?.logo_url,
    primary_color: tenantData?.primary_color,
    secondary_color: tenantData?.secondary_color,
    accent_color: tenantData?.accent_color,
    background_color: tenantData?.background_color,
    text_color: tenantData?.text_color,
    heading_font: tenantData?.heading_font,
    body_font: tenantData?.body_font,
    font_size_base: tenantData?.font_size_base,
    font_size_heading: tenantData?.font_size_heading,
  }

  console.log("[v0] Rendering members page components...")

  return (
    <DashboardLayout user={{ ...userData, church_tenants: tenantData }} tenantTheme={tenantTheme}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              Members Directory
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your congregation directory - members without system access
            </p>
          </div>
          <CSVImportDialog />
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <MemberList />
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <GroupsManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
