import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ClassesView } from "@/components/classes/classes-view"

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (!userData) {
    redirect("/setup-profile")
  }

  const tenantId = params.tenant || userData.church_tenant_id

  if (userData.is_super_admin && !tenantId) {
    redirect("/super-admin")
  }

  if (!tenantId) {
    redirect("/setup-profile")
  }

  const { data: tenantData } = await supabase.from("church_tenants").select("*").eq("id", tenantId).single()

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("church_tenant_id", tenantId)
    .order("created_at", { ascending: false })

  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("class_id, id")
    .in("class_id", classes?.map((c) => c.id) || [])

  const teacherIds = classes?.map((c) => c.teacher_id).filter(Boolean) || []
  const { data: teachers } = await supabase.from("users").select("id, full_name").in("id", teacherIds)

  const classesWithDetails =
    classes?.map((classItem) => {
      const teacher = teachers?.find((t) => t.id === classItem.teacher_id)
      const classEnrollments = enrollments?.filter((e) => e.class_id === classItem.id) || []

      return {
        ...classItem,
        teacher: teacher || null,
        class_enrollments: classEnrollments,
      }
    }) || []

  const { data: members } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("church_tenant_id", tenantId)
    .order("full_name")

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

  return (
    <DashboardLayout
      user={{ ...userData, church_tenants: tenantData }}
      tenantId={params.tenant}
      tenantTheme={tenantTheme}
    >
      <ClassesView classes={classesWithDetails} members={members || []} churchTenantId={tenantId} userId={user.id} />
    </DashboardLayout>
  )
}
