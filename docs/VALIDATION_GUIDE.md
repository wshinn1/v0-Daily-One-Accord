# Validation & Quality Assurance Guide

This guide explains how to use the validation and quality assurance tools in the Daily One Accord system.

## Table of Contents

1. [Zod Validation](#zod-validation)
2. [Database Constraints](#database-constraints)
3. [Pre-commit Hooks](#pre-commit-hooks)
4. [Code Quality Tools](#code-quality-tools)

## Zod Validation

### Overview

All API routes use Zod schemas for runtime validation. This catches invalid data before it reaches the database.

### Available Schemas

Located in `lib/validation/schemas.ts`:

- `createUserSchema` - Validate user creation
- `createEventSchema` - Validate event creation
- `createClassSchema` - Validate class creation
- `sendSMSSchema` - Validate SMS messages
- `businessPlanLoginSchema` - Validate business plan login
- And many more...

### Using Validation in API Routes

**Method 1: Using asyncHandler (Recommended)**

\`\`\`typescript
import { asyncHandler } from "@/lib/errors/handler"
import { createEventSchema } from "@/lib/validation/schemas"
import { ValidationError } from "@/lib/errors/types"

export const POST = asyncHandler(async (request: Request) => {
  const body = await request.json()
  
  const validation = createEventSchema.safeParse(body)
  if (!validation.success) {
    throw new ValidationError("Invalid event data", {
      errors: validation.error.flatten().fieldErrors,
    })
  }

  const validatedData = validation.data
  // Use validatedData (fully type-safe)
})
\`\`\`

**Method 2: Using withValidation middleware**

\`\`\`typescript
import { withValidation } from "@/lib/validation/middleware"
import { createEventSchema } from "@/lib/validation/schemas"

export const POST = withValidation(
  createEventSchema,
  async (req, validatedData) => {
    // validatedData is already validated and type-safe
    return NextResponse.json({ success: true })
  }
)
\`\`\`

### Creating Custom Schemas

\`\`\`typescript
import { z } from "zod"
import { emailSchema, uuidSchema } from "@/lib/validation/schemas"

export const myCustomSchema = z.object({
  email: emailSchema,
  tenant_id: uuidSchema,
  custom_field: z.string().min(5).max(100),
  optional_field: z.number().optional(),
})
\`\`\`

### Validation Benefits

- **Type Safety**: Automatic TypeScript types from schemas
- **Runtime Validation**: Catches bad data before database operations
- **User-Friendly Errors**: Clear error messages for each field
- **Consistent Validation**: Same rules across all API routes

## Database Constraints

### Overview

Database constraints prevent invalid data at the database level, providing a second layer of protection.

### Running the Constraints Script

\`\`\`bash
# In Supabase SQL Editor, run:
scripts/add-database-constraints.sql
\`\`\`

### What Gets Added

**Foreign Key Constraints**
- Ensures relationships between tables are valid
- Prevents orphaned records
- Cascades deletes where appropriate

**Unique Constraints**
- Prevents duplicate emails per tenant
- Ensures unique church codes and slugs
- Prevents duplicate team/class memberships

**Check Constraints**
- Validates event times (end > start)
- Ensures positive values (capacity, duration)
- Validates date ranges

**Indexes**
- Improves query performance on foreign keys
- Speeds up common queries (by tenant, by date)

### Benefits

- **Data Integrity**: Invalid data cannot enter the database
- **Referential Integrity**: Relationships stay consistent
- **Performance**: Indexes speed up queries
- **Documentation**: Constraints document business rules

## Pre-commit Hooks

### Overview

Pre-commit hooks run automatically before each commit, catching errors before they're pushed.

### Setup

\`\`\`bash
# Install dependencies (includes Husky)
npm install

# Husky will automatically set up git hooks
\`\`\`

### What Runs on Commit

1. **TypeScript Type Check** - Catches type errors
2. **ESLint** - Catches code quality issues
3. **Prettier** - Formats code consistently
4. **Lint-staged** - Only checks changed files (fast!)

### Manual Commands

\`\`\`bash
# Run type check
npm run type-check

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
\`\`\`

### Bypassing Hooks (Not Recommended)

\`\`\`bash
# Only use in emergencies
git commit --no-verify -m "Emergency fix"
\`\`\`

## Code Quality Tools

### ESLint

Catches common mistakes and enforces best practices.

**Configuration**: `.eslintrc.json`

**Rules Enforced**:
- No unused variables
- Proper React hooks usage
- Consistent code style
- TypeScript best practices

### Prettier

Formats code consistently across the team.

**Configuration**: `.prettierrc`

**Settings**:
- No semicolons
- Double quotes
- 2 space indentation
- 120 character line width

### TypeScript

Catches type errors at compile time.

**Configuration**: `tsconfig.json`

**Strict Mode Enabled**:
- No implicit any
- Strict null checks
- No unused locals/parameters

## Best Practices

### 1. Always Validate API Inputs

\`\`\`typescript
// ❌ Bad - No validation
export async function POST(request: Request) {
  const body = await request.json()
  // Use body directly (dangerous!)
}

// ✅ Good - With validation
export const POST = asyncHandler(async (request: Request) => {
  const body = await request.json()
  const validation = mySchema.safeParse(body)
  if (!validation.success) {
    throw new ValidationError("Invalid data", {
      errors: validation.error.flatten().fieldErrors,
    })
  }
  // Use validation.data (safe!)
})
\`\`\`

### 2. Use Type-Safe Database Queries

\`\`\`typescript
// ❌ Bad - No type safety
const { data } = await supabase.from("users").select("*")

// ✅ Good - Type-safe
const { data } = await supabase
  .from("users")
  .select("id, email, full_name, role")
  .returns<User[]>()
\`\`\`

### 3. Handle Errors Properly

\`\`\`typescript
// ❌ Bad - Generic error
throw new Error("Something went wrong")

// ✅ Good - Specific error with context
throw new ValidationError("Invalid email format", {
  field: "email",
  value: email,
})
\`\`\`

### 4. Write Defensive Code

\`\`\`typescript
// ❌ Bad - Assumes data exists
const userName = user.full_name.toUpperCase()

// ✅ Good - Handles missing data
const userName = user?.full_name?.toUpperCase() ?? "Unknown"
\`\`\`

## Troubleshooting

### Pre-commit Hook Fails

\`\`\`bash
# Check what failed
npm run type-check
npm run lint

# Fix issues
npm run lint:fix
npm run format
\`\`\`

### Validation Errors in Production

Check the error logs at `/super-admin/error-logs` to see:
- Which validation failed
- What data was sent
- Which user encountered the error

### Database Constraint Violations

If you see constraint errors:
1. Check the error message for which constraint failed
2. Update your validation schema to match the constraint
3. Fix the data being sent

## Summary

The validation and quality system provides three layers of protection:

1. **Pre-commit Hooks** - Catch errors before pushing code
2. **Zod Validation** - Validate data at runtime in API routes
3. **Database Constraints** - Enforce rules at the database level

This ensures data integrity, prevents bugs, and maintains code quality as you continue to build.
