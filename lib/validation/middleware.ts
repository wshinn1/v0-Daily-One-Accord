import { type NextRequest, NextResponse } from "next/server"
import type { z } from "zod"
import { ValidationError } from "@/lib/errors/types"

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        throw new ValidationError("Validation failed", {
          errors: result.error.flatten().fieldErrors,
        })
      }

      return await handler(req, result.data)
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            error: error.message,
            details: error.metadata?.errors,
          },
          { status: 400 },
        )
      }
      throw error
    }
  }
}
