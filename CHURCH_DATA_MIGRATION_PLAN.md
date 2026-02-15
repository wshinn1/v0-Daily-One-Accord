# Church Data Migration System - Implementation Plan

**Last Updated:** October 28, 2025  
**Status:** Planning Phase  
**Priority:** High - Reduces onboarding friction significantly

## Overview

Build a one-click migration system that allows churches to seamlessly transfer their data from existing church management systems (Planning Center, Breeze, CCB, etc.) to Daily One Accord. This feature will dramatically reduce onboarding time and eliminate manual data entry.

## Core Principles

1. **User Control** - Churches review and approve all data before import
2. **Data Integrity** - Validate and clean data during migration
3. **Transparency** - Show clear progress and what's being imported
4. **Reversibility** - Allow rollback if something goes wrong
5. **Privacy** - Secure OAuth flows, never store external credentials

---

## Phase 1: Planning Center Integration (Foundation)

**Goal:** Build the core migration infrastructure with Planning Center as the first integration

### Database Schema

**Tables to Create:**
\`\`\`sql
-- Migration jobs tracking
CREATE TABLE migration_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL, -- 'planning_center', 'breeze', etc.
  status TEXT NOT NULL, -- 'pending', 'authenticating', 'importing', 'validating', 'completed', 'failed', 'rolled_back'
  total_records INTEGER DEFAULT 0,
  imported_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB,
  metadata JSONB, -- Store API tokens, settings, etc.
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Migration field mappings (customizable per church)
CREATE TABLE migration_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  source_system TEXT NOT NULL,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  transformation_rule JSONB, -- Optional data transformation rules
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration preview data (temporary storage before confirmation)
CREATE TABLE migration_preview_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_job_id UUID REFERENCES migration_jobs(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'member', 'group', 'event', 'donation'
  source_data JSONB NOT NULL,
  mapped_data JSONB NOT NULL,
  validation_status TEXT, -- 'valid', 'warning', 'error'
  validation_messages TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Planning Center OAuth Integration

**Files to Create:**
1. `lib/integrations/planning-center/oauth.ts` - OAuth flow handler
2. `lib/integrations/planning-center/api-client.ts` - API wrapper
3. `lib/integrations/planning-center/data-mapper.ts` - Data transformation
4. `app/api/migrations/planning-center/auth/route.ts` - OAuth callback
5. `app/api/migrations/planning-center/connect/route.ts` - Initiate connection

**Environment Variables Needed:**
- `PLANNING_CENTER_CLIENT_ID`
- `PLANNING_CENTER_CLIENT_SECRET`
- `PLANNING_CENTER_REDIRECT_URI`

### Data Mapping Layer

**Entities to Map:**
- **People** → Members
  - Names, emails, phone numbers
  - Addresses
  - Birthdays, anniversaries
  - Custom fields
  - Profile photos
  
- **Groups** → Classes/Groups
  - Group names, descriptions
  - Leaders
  - Members
  - Meeting schedules

- **Events** → Attendance Events
  - Event names, dates
  - Attendees
  - Check-in data

- **Giving** (Optional) → Donations
  - Donor information
  - Transaction history
  - Fund designations

### UI Components

**Files to Create:**
1. `app/dashboard/settings/migration/page.tsx` - Migration hub
2. `components/migration/migration-wizard.tsx` - Step-by-step wizard
3. `components/migration/system-selector.tsx` - Choose source system
4. `components/migration/oauth-connector.tsx` - OAuth authentication
5. `components/migration/data-preview.tsx` - Review data before import
6. `components/migration/field-mapper.tsx` - Customize field mappings
7. `components/migration/import-progress.tsx` - Real-time progress tracker
8. `components/migration/import-summary.tsx` - Results and errors

**Wizard Steps:**
1. Select source system (Planning Center)
2. Authenticate with OAuth
3. Select data types to import (People, Groups, Events)
4. Review and customize field mappings
5. Preview sample data
6. Confirm and start import
7. Monitor progress
8. Review results

### Background Job Processing

**Inngest Functions to Create:**
1. `lib/inngest/functions/migration-import-people.ts`
2. `lib/inngest/functions/migration-import-groups.ts`
3. `lib/inngest/functions/migration-import-events.ts`
4. `lib/inngest/functions/migration-cleanup.ts`

**Features:**
- Batch processing (100 records at a time)
- Rate limit handling
- Automatic retry on failures
- Progress updates via database
- Error logging and reporting

### API Routes

**Files to Create:**
1. `app/api/migrations/jobs/route.ts` - List/create migration jobs
2. `app/api/migrations/jobs/[jobId]/route.ts` - Get job status
3. `app/api/migrations/jobs/[jobId]/start/route.ts` - Start import
4. `app/api/migrations/jobs/[jobId]/cancel/route.ts` - Cancel import
5. `app/api/migrations/jobs/[jobId]/rollback/route.ts` - Rollback import
6. `app/api/migrations/preview/route.ts` - Generate preview data
7. `app/api/migrations/field-mappings/route.ts` - Manage mappings

### Validation & Error Handling

**Validation Rules:**
- Required fields present
- Email format validation
- Phone number formatting
- Duplicate detection
- Data type validation
- Relationship integrity (e.g., group leaders must be members)

**Error Handling:**
- Log all errors with context
- Continue processing on non-critical errors
- Provide detailed error reports
- Allow manual resolution of errors
- Support partial imports

---

## Phase 2: Additional Systems Integration

**Goal:** Expand to support other popular church management systems

### Systems to Add:
1. **Breeze ChMS** - Similar API structure to Planning Center
2. **CCB (Church Community Builder)** - Widely used, good API
3. **Elvanto** - Popular in Australia/UK
4. **Rock RMS** - Open source, self-hosted option

### Implementation per System:
- Create system-specific API client
- Build data mapper for that system's schema
- Add OAuth configuration
- Update UI to support system selection
- Test with sample data

---

## Phase 3: Advanced Features

**Goal:** Enhance the migration experience with smart features

### Features to Add:

1. **Duplicate Detection & Merging**
   - Identify potential duplicates before import
   - Smart matching algorithm (name + email + phone)
   - UI for manual review and merge decisions

2. **Incremental Sync**
   - Keep data in sync after initial import
   - Scheduled background sync jobs
   - Conflict resolution (which system is source of truth)

3. **Custom Field Mapping**
   - Allow churches to map custom fields
   - Save mapping templates for reuse
   - Share mapping templates between churches

4. **Data Transformation Rules**
   - Text formatting (uppercase, lowercase, title case)
   - Phone number formatting
   - Date format conversion
   - Custom JavaScript transformations

5. **Migration Templates**
   - Pre-built mappings for common scenarios
   - Community-contributed templates
   - Version control for templates

6. **Rollback & Undo**
   - Complete rollback of failed imports
   - Selective undo (remove specific records)
   - Backup before import

7. **Migration Analytics**
   - Track migration success rates
   - Identify common errors
   - Optimize mapping suggestions

---

## Phase 4: Self-Service Migration Hub

**Goal:** Create a comprehensive migration center with resources

### Features:

1. **Migration Guides**
   - Step-by-step tutorials per system
   - Video walkthroughs
   - Common issues and solutions

2. **Data Export Tools**
   - Help churches export from their current system
   - CSV import as fallback option
   - Template CSV files

3. **Migration Support Chat**
   - Live chat during migration
   - AI-powered troubleshooting
   - Escalation to human support

4. **Migration Scheduling**
   - Schedule imports for off-hours
   - Email notifications on completion
   - Automatic rollback on critical errors

---

## Technical Considerations

### Security
- Never store external system credentials permanently
- Use short-lived OAuth tokens
- Encrypt sensitive data in migration_jobs.metadata
- Audit log all migration activities
- RLS policies on all migration tables

### Performance
- Use Inngest for background processing
- Batch API requests to avoid rate limits
- Cache API responses when possible
- Use database transactions for atomicity
- Monitor job queue length

### Data Quality
- Validate all data before import
- Provide data quality reports
- Flag suspicious data for review
- Support data cleanup before import

### User Experience
- Clear progress indicators
- Estimated time remaining
- Ability to pause/resume
- Email notifications
- Detailed success/error reports

---

## Success Metrics

- **Adoption Rate:** % of new churches using migration vs manual entry
- **Success Rate:** % of migrations completed without errors
- **Time Saved:** Average time saved vs manual entry
- **Data Quality:** % of records imported without validation errors
- **User Satisfaction:** NPS score for migration experience

---

## Future Enhancements

1. **Bi-directional Sync** - Keep systems in sync both ways
2. **Migration Marketplace** - Paid migration services for complex cases
3. **API for Third-Party Integrations** - Let others build connectors
4. **White-Label Migration** - Offer migration as a service to other platforms
5. **AI-Powered Mapping** - Use ML to suggest optimal field mappings

---

## Implementation Timeline

- **Phase 1 (Planning Center):** 3-4 weeks
- **Phase 2 (Additional Systems):** 2 weeks per system
- **Phase 3 (Advanced Features):** 4-6 weeks
- **Phase 4 (Self-Service Hub):** 2-3 weeks

**Total Estimated Time:** 12-16 weeks for complete system

---

## Notes

- Start with Planning Center as it has the best API documentation
- Consider offering white-glove migration service for large churches
- Build comprehensive testing with sample data from each system
- Document all API quirks and limitations
- Create fallback CSV import for unsupported systems
