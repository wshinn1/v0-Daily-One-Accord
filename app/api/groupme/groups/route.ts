import { type NextRequest, NextResponse } from "next/server"
import { asyncHandler } from "@/lib/errors/handler"
import { ValidationError, ExternalAPIError } from "@/lib/errors/types"

export const GET = asyncHandler(async (request: NextRequest) => {
  const accessToken = request.headers.get("X-Access-Token")

  if (!accessToken) {
    throw new ValidationError("Access token is required")
  }

  // Fetch user's GroupMe groups
  const response = await fetch("https://api.groupme.com/v3/groups", {
    headers: {
      "X-Access-Token": accessToken,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ExternalAPIError("Failed to fetch GroupMe groups", "GroupMe")
  }

  return NextResponse.json({ groups: data.response || [] })
})
