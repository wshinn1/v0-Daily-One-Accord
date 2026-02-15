import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CheckCircle2, Circle, Clock, FileText, Layers } from "lucide-react"

export default async function TableViewRoadmapPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userData } = await supabase
    .from("users")
    .select("church_tenant_id, full_name, role")
    .eq("id", user.id)
    .single()

  if (!userData?.church_tenant_id) {
    redirect("/dashboard")
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

  return (
    <DashboardLayout user={{ ...userData, church_tenants: tenantData }} tenantTheme={tenantTheme}>
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Table View Roadmap</h1>
                <p className="text-slate-600 mt-1">Monday.com-style table view for Unity boards</p>
              </div>
            </div>
          </div>

          {/* Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Overview</h2>
            <p className="text-slate-700 leading-relaxed">
              Add a Monday.com-style table view for kanban boards that displays the same data in a spreadsheet-like
              format with inline editing, sorting, filtering, and column customization.
            </p>
          </div>

          {/* Architecture Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Data Flow</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Same Database Tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Same API Routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Shared State</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>View Preference Storage</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-2">Technical Stack</h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>TanStack Table (React Table v8)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Inline Editing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Drag and Drop (dnd-kit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Responsive Design</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Implementation Tasks</h2>

            {/* Task 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Circle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Task 1: Create Table View Component</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      15 min
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Build the foundation table component that displays kanban cards in a spreadsheet format.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">TanStack Table</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Responsive</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Loading States</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Circle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Task 2: Add View Toggle</h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      10 min
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Allow users to switch between Kanban and Table views seamlessly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Toggle UI</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">LocalStorage</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Smooth Transition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Circle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Task 3: Implement Inline Cell Editing</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      20 min
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">Enable users to edit card properties directly in table cells.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Click-to-Edit</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Multiple Editors</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Optimistic Updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Circle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Task 4: Add Sorting and Filtering</h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      15 min
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">Enable users to sort and filter table data like a spreadsheet.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Multi-Column Sort</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Advanced Filters</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">URL Persistence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 5 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Circle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Task 5: Add Column Customization</h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      15 min
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">
                    Allow users to customize which columns are visible and their order.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Show/Hide</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Reorder</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Resize</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Presets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Total Estimated Time</h3>
                <p className="text-slate-600">Complete implementation with all features</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">75 min</div>
                <div className="text-sm text-slate-600">1 hour 15 minutes</div>
              </div>
            </div>
          </div>

          {/* Future Enhancements */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Future Enhancements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Bulk Actions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Export to CSV/Excel</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Row Grouping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Subtasks as Expandable Rows</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Cell History/Audit Log</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
