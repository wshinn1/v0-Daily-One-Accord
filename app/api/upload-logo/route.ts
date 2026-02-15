import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler, ValidationError } from "@/lib/errors/handler"

export const POST = asyncHandler(async (request: NextRequest) => {
  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    throw new ValidationError("No file provided")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new ValidationError("File must be an image")
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new ValidationError("File size must be less than 5MB")
  }

  // Upload to Vercel Blob with a unique filename
  const timestamp = Date.now()
  const filename = `logos/${timestamp}-${file.name}`

  const blob = await put(filename, file, {
    access: "public",
  })

  return NextResponse.json({
    url: blob.url,
    filename: file.name,
  })
})
