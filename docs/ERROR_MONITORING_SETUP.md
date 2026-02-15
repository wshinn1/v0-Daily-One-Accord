# Error Monitoring Setup Guide

## Overview

Your application now has comprehensive error monitoring with three layers:

1. **Console Logging** - Immediate visibility in Vercel logs
2. **Database Logging** - Persistent error storage in Supabase
3. **Sentry Integration** - Real-time alerts and session replay (optional)

## Where Errors Go

### 1. Vercel Logs (Automatic)
- All errors are logged to console with `[v0]` prefix
- View at: Vercel Dashboard → Your Project → Logs
- Retention: 7 days (Hobby plan) or longer (Pro plan)

### 2. Supabase Database (Automatic)
- Errors stored in `error_logs` table
- View at: `/super-admin/error-logs` page
- Retention: Unlimited (until manually deleted)
- Includes: error type, message, stack trace, user context, tenant context

### 3. Sentry (Optional - Requires Setup)
- Real-time error tracking with alerts
- Session replay to see what users did before errors
- Performance monitoring for slow API calls

## Setup Instructions

### Step 1: Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor:

1. `scripts/create-error-logs-table.sql` - Creates error logging table
2. `scripts/fix-supabase-security-warnings.sql` - Fixes security warnings

### Step 2: Enable Sentry (Optional)

1. Create account at https://sentry.io
2. Create new Next.js project
3. Copy your DSN
4. Add to Vercel environment variables:
   \`\`\`
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   \`\`\`

### Step 3: Enable Leaked Password Protection

In Supabase Dashboard:
1. Go to Authentication → Policies
2. Enable "Check for leaked passwords"
3. This prevents users from using compromised passwords

## Viewing Errors

### Super Admin Error Dashboard
- URL: `/super-admin/error-logs`
- Filter by resolved/unresolved
- Mark errors as resolved
- View error details, stack traces, and context

### Vercel Logs
- Real-time streaming logs
- Search by `[v0]` prefix
- Filter by error level

### Sentry Dashboard (if enabled)
- Real-time alerts via email/Slack
- Error grouping and trends
- Session replay videos
- Performance monitoring

## Security Fixes Applied

All 25 database functions now have fixed `search_path` to prevent SQL injection:
- ✅ `ensure_default_church_service`
- ✅ `prevent_default_service_deletion`
- ✅ `user_has_role`
- ✅ And 22 more functions...

Materialized views now restricted:
- ✅ `daily_attendance_summary` - Only authenticated users
- ✅ `visitor_pipeline_summary` - Only authenticated users

## Next Steps

1. Publish changes to deploy error monitoring
2. Run SQL migrations in Supabase
3. Enable leaked password protection in Supabase Auth settings
4. (Optional) Set up Sentry for advanced monitoring
5. Monitor errors at `/super-admin/error-logs`
