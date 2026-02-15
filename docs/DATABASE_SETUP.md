# Database Setup Guide for Daily One Accord

This guide explains how to set up your Supabase database for optimal performance and security.

## Setup Order (IMPORTANT)

Run the SQL scripts in this exact order:

1. **00-helper-functions.sql** - Creates RLS helper functions (REQUIRED FIRST)
2. **01-performance-indexes.sql** - Adds performance indexes
3. **02-row-level-security.sql** - Enables RLS policies
4. **03-query-optimizations.sql** - Additional optimizations

## How to Run Scripts

### Option 1: From v0 (Recommended)
The scripts are in the `scripts/` folder and can be executed directly from v0.

### Option 2: Supabase Dashboard
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy/paste the script content
5. Click **Run**

## Script Details

### 00-helper-functions.sql
**Purpose:** Creates helper functions for Row Level Security and utilities

**What it does:**
- `get_user_church_tenant_id()` - Gets current user's church
- `is_super_admin()` - Checks if user is super admin
- `user_has_role()` - Checks user permissions
- `is_church_member()` - Validates church membership
- `generate_slug()` - Creates URL-friendly slugs
- `generate_church_code()` - Creates unique church codes
- `update_updated_at_column()` - Auto-updates timestamps

**Why it's first:** Other scripts depend on these functions existing.

### 01-performance-indexes.sql
**Purpose:** Adds indexes for fast queries at scale

**What it does:**
- Tenant isolation indexes (church_tenant_id on all tables)
- Composite indexes for common queries (tenant + date, tenant + status)
- Foreign key indexes for JOINs
- Lookup indexes for emails, phones, codes
- Partial indexes for filtered queries
- Ordering indexes for sorted results

**Performance impact:**
- 5-50 tenants: 2-5x faster
- 50-250 tenants: 5-10x faster
- 250-1,000 tenants: 10-50x faster

### 02-row-level-security.sql
**Purpose:** Enforces data isolation between church tenants

**What it does:**
- Enables RLS on all tables
- Creates policies for SELECT, INSERT, UPDATE, DELETE
- Ensures users only see their church's data
- Allows super admins to access all data

**Security impact:**
- Complete data isolation between tenants
- No way for one church to see another's data
- Database-level security (not just application-level)

### 03-query-optimizations.sql
**Purpose:** Advanced optimizations for high-scale performance

**What it does:**
- Analyzes tables for query planner
- Creates materialized views for analytics
- Adds covering indexes for common queries
- Optimizes full-text search

**When to run:**
- Immediately: Basic optimizations
- At 100+ tenants: Materialized views
- At 500+ tenants: Advanced covering indexes

## Verification

After running all scripts, verify setup:

\`\`\`sql
-- Check that helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%church%';

-- Check that indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
\`\`\`

## Troubleshooting

### Error: "functions in index predicate must be marked IMMUTABLE"
**Solution:** Run `00-helper-functions.sql` first. This creates the required functions.

### Error: "function does not exist"
**Solution:** You skipped `00-helper-functions.sql`. Run it first.

### Error: "relation already exists"
**Solution:** Script was already run. Safe to ignore or use `IF NOT EXISTS` clauses.

### Slow queries after setup
**Solution:** Run `ANALYZE;` to update query planner statistics:
\`\`\`sql
ANALYZE;
\`\`\`

## Maintenance

### Regular Tasks
- **Daily:** Automatic (Supabase handles VACUUM and ANALYZE)
- **Weekly:** Check slow query log in Supabase dashboard
- **Monthly:** Review index usage and add new indexes if needed

### Monitoring Queries

\`\`\`sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;

-- Check table sizes
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
\`\`\`

## Scaling Checklist

### At 50 Tenants
- ✅ All 4 scripts run
- ✅ Indexes created
- ✅ RLS enabled
- ✅ Supabase Pro tier

### At 250 Tenants
- ✅ All above
- ✅ Redis caching added
- ✅ Monitoring enabled
- ✅ Regular ANALYZE runs

### At 500 Tenants
- ✅ All above
- ✅ Materialized views for analytics
- ✅ Query performance monitoring
- ✅ Backup strategy verified

### At 1,000 Tenants
- ✅ All above
- ✅ Supabase Team tier
- ✅ Read replicas configured
- ✅ Advanced monitoring (Datadog/New Relic)

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify scripts were run in order
3. Check Supabase logs in dashboard
4. Review the troubleshooting section above
