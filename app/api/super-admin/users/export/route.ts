import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { asyncHandler, UnauthorizedError } from "@/lib/errors/handler"

export const GET = asyncHandler(async () => {
  const supabase = await createClient()

  // Check if user is super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError("Not authenticated")
  }

  const { data: userData } = await supabase.from("users").select("is_super_admin").eq("id", user.id).single()

  if (!userData?.is_super_admin) {
    throw new UnauthorizedError("Super admin access required")
  }

  // Fetch all users with church tenant information
  const { data: users, error } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      full_name,
      phone,
      role,
      created_at,
      church_tenant_id,
      church_tenants (
        name,
        church_code
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  // Convert to CSV format
  const csvHeaders = ["ID", "Email", "Full Name", "Phone", "Role", "Church Name", "Church Code", "Created At"]

  const csvRows = users.map((user: any) => [
    user.id,
    user.email || "",
    user.full_name || "",
    user.phone || "",
    user.role || "",
    user.church_tenants?.name || "",
    user.church_tenants?.church_code || "",
    new Date(user.created_at).toISOString(),
  ])

  const csvContent = [
    csvHeaders.join(","),
    ...csvRows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell)
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(","),
    ),
  ].join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
})
