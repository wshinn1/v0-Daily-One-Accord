import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { AuthenticationError, DatabaseError, ValidationError, ExternalAPIError } from "@/lib/errors/types"

export const GET = asyncHandler(async (request: Request) => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthenticationError("User must be authenticated")
  }

  console.log("[v0] Fetching user data for:", user.id)

  // Get user's church tenant ID
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("church_tenant_id")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    throw new DatabaseError("User not found", { originalError: userError })
  }

  console.log("[v0] User church_tenant_id:", userData.church_tenant_id)

  // Get church tenant's Google Drive API key
  const { data: tenantData, error: tenantError } = await supabase
    .from("church_tenants")
    .select("google_drive_api_key")
    .eq("id", userData.church_tenant_id)
    .single()

  if (tenantError || !tenantData) {
    throw new DatabaseError("Church tenant not found", { originalError: tenantError })
  }

  if (!tenantData.google_drive_api_key) {
    throw new ValidationError("Google Drive API key not configured")
  }

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get("folderId")

  if (!folderId) {
    throw new ValidationError("Folder ID is required")
  }

  console.log("[v0] Fetching files from folder:", folderId)

  const apiKey = tenantData.google_drive_api_key

  // Fetch files from Google Drive API
  const driveUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)`
  console.log("[v0] Google Drive API URL:", driveUrl.replace(apiKey, "***"))

  const response = await fetch(driveUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("[v0] Google Drive API error:", errorData)
    throw new ExternalAPIError("Failed to fetch files from Google Drive", {
      service: "Google Drive",
      statusCode: response.status,
      originalError: errorData,
    })
  }

  const data = await response.json()
  console.log("[v0] Successfully fetched", data.files?.length || 0, "files")
  return NextResponse.json({ files: data.files || [] })
})
