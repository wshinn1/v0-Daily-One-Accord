# SQL Migration Script Execution Order

To properly set up the database and fix security warnings, run the SQL scripts in this order:

## 1. Helper Functions (REQUIRED FIRST)
\`\`\`bash
scripts/00-helper-functions.sql
\`\`\`
This creates all the helper functions used by RLS policies and other database operations.

## 2. Error Logging Table
\`\`\`bash
scripts/create-error-logs-table.sql
\`\`\`
Creates the `error_logs` table for centralized error tracking.

## 3. Security Warnings Fix
\`\`\`bash
scripts/fix-supabase-security-warnings.sql
\`\`\`
Fixes all Supabase security warnings by setting `search_path` on functions and restricting materialized view access.

**Note:** This script will fail if you haven't run `00-helper-functions.sql` first!

## 4. Business Plan Users (if needed)
\`\`\`bash
scripts/create-business-plan-users-table.sql
\`\`\`
Creates the `business_plan_users` table if you're using the business plan feature.

## Common Errors

### "function does not exist"
- **Cause:** You tried to run `fix-supabase-security-warnings.sql` before `00-helper-functions.sql`
- **Solution:** Run `00-helper-functions.sql` first, then retry

### "relation already exists"
- **Cause:** You're trying to create a table that already exists
- **Solution:** Skip that script or use `CREATE TABLE IF NOT EXISTS`

## Verifying Success

After running all scripts, check the Supabase dashboard:
- Database > Functions: Should see all helper functions with `search_path` set
- Database > Tables: Should see `error_logs` table
- Auth > Policies: Security warnings should be resolved
