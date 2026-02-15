import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { asyncHandler } from "@/lib/errors/handler"
import { DatabaseError, ValidationError, AuthenticationError } from "@/lib/errors/types"

export const GET = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  const churchTenantId = searchParams.get("churchTenantId") || searchParams.get("church_tenant_id")

  if (!churchTenantId) {
    throw new ValidationError("Church tenant ID required")
  }

  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("church_tenant_id", churchTenantId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new DatabaseError("Failed to fetch email templates", { cause: error })
  }

  return NextResponse.json(data)
})

export const POST = asyncHandler(async (request: NextRequest) => {
  const supabase = await createServerClient()
  const body = await request.json()
  const {
    churchTenantId,
    church_tenant_id,
    name,
    description,
    blocks,
    template_type,
    subject,
    body: emailBody,
    is_default,
  } = body

  const tenantId = churchTenantId || church_tenant_id

  if (!tenantId || !name) {
    throw new ValidationError("Church tenant ID and name are required")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User not authenticated")
  }

  const { data, error } = await supabase
    .from("email_templates")
    .insert({
      church_tenant_id: tenantId,
      name,
      description,
      blocks: blocks || null,
      template_type: template_type || "custom",
      subject: subject || null,
      body: emailBody || null,
      is_default: is_default || false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new DatabaseError("Failed to create email template", { cause: error })
  }

  return NextResponse.json(data)
})
