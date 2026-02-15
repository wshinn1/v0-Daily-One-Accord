import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ApiDocumentation } from "@/components/api-docs/api-documentation"

export default async function ApiDocsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">Complete reference for the Daily One Accord API endpoints</p>
      </div>

      <ApiDocumentation />
    </div>
  )
}
