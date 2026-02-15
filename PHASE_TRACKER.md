# Kanban + Slack Integration - Phase Tracker

This document tracks the progress of implementing Monday.com-like features for the visitor kanban board with Slack integration.

## Phase 1: Foundation ✅ COMPLETE

**Goal:** Add core Monday.com-like features to make the kanban board more powerful and collaborative.

### Features

#### 1. Due Dates ✅ COMPLETE
**Purpose:** Track when follow-ups are due and get visual reminders for overdue tasks.

**Tasks:**
- [x] Add `due_date` column to visitors table
- [x] Update visitor card to display due date badge
- [x] Add due date picker to visitor edit/create form
- [x] Add visual indicators (red for overdue, yellow for due soon)
- [x] Update API route to handle due_date

**Files:**
- `scripts/109-add-due-dates-to-visitors.sql` ✅
- `components/visitors/visitor-card.tsx` ✅
- `components/visitors/add-visitor-dialog.tsx` ✅
- `components/visitors/edit-visitor-dialog.tsx` ✅
- `components/visitors/visitor-kanban.tsx` ✅

---

#### 2. Comments System ✅ COMPLETE
**Purpose:** Enable team collaboration with threaded comments on visitor cards.

**Tasks:**
- [x] Create `visitor_comments` table
- [x] Create API route for fetching comments (GET)
- [x] Create API route for adding comments (POST)
- [x] Create API route for deleting comments (DELETE)
- [x] Create comments thread component
- [x] Add comments section to visitor detail view

**Files:**
- `scripts/110-create-visitor-comments-table.sql` ✅
- `app/api/visitors/[id]/comments/route.ts` ✅
- `app/api/visitors/[id]/comments/[commentId]/route.ts` ✅
- `components/visitors/visitor-comments.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅
- `components/visitors/visitor-card.tsx` ✅

---

#### 3. File Attachments ✅ COMPLETE
**Purpose:** Attach documents, images, and files to visitor cards.

**Tasks:**
- [x] Create `visitor_attachments` table
- [x] Create API route for file upload (POST with Vercel Blob)
- [x] Create API route for file download/delete
- [x] Create file upload component
- [x] Add attachments section to visitor detail view

**Files:**
- `scripts/111-create-visitor-attachments-table.sql` ✅
- `app/api/visitors/[id]/attachments/route.ts` ✅
- `app/api/visitors/[id]/attachments/[attachmentId]/route.ts` ✅
- `components/visitors/visitor-attachments.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅

---

#### 4. Labels/Tags ✅ COMPLETE
**Purpose:** Categorize visitors with color-coded labels (e.g., "VIP", "Needs Prayer").

**Tasks:**
- [x] Create `visitor_labels` and `visitor_label_assignments` tables
- [x] Create API routes for label CRUD operations
- [x] Create label selector component for visitor cards
- [x] Add label badges to visitor cards
- [x] Add default labels (VIP, Needs Prayer, Interested in Membership, First Time)

**Files:**
- `scripts/112-create-visitor-labels-tables.sql` ✅
- `app/api/labels/route.ts` ✅
- `app/api/labels/[id]/route.ts` ✅
- `app/api/visitors/[id]/labels/route.ts` ✅
- `components/visitors/label-selector.tsx` ✅
- `components/visitors/visitor-card.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅

---

#### 5. Custom Fields ✅ COMPLETE
**Purpose:** Create tenant-specific custom fields (e.g., "Preferred Service Time", "How They Heard About Us").

**Tasks:**
- [x] Create `custom_fields` and `visitor_custom_field_values` tables
- [x] Create API routes for custom field definitions (CRUD)
- [x] Create API routes for custom field values (GET, POST, PUT)
- [x] Create custom field editor component
- [x] Update visitor detail view to show custom fields

**Files:**
- `scripts/113-create-custom-fields-tables.sql` ✅
- `app/api/custom-fields/route.ts` ✅
- `app/api/custom-fields/[id]/route.ts` ✅
- `app/api/visitors/[id]/custom-fields/route.ts` ✅
- `components/visitors/custom-fields-editor.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅

---

## Phase 2: Collaboration ✅ COMPLETE

**Goal:** Add automation, recurring tasks, and team collaboration features.

### Features

#### 1. Automations ✅ COMPLETE
**Purpose:** Trigger actions automatically based on events (e.g., auto-assign new visitors, send Slack notifications).

**Tasks:**
- [x] Create `visitor_automations` and `automation_logs` tables
- [x] Create API routes for automation CRUD operations
- [x] Create Inngest function to execute automations
- [x] Create admin UI for managing automations
- [x] Support triggers: new visitor added, status changed
- [x] Support actions: assign to user, send Slack notification

**Files:**
- `scripts/114-create-automations-tables.sql` ✅
- `app/api/automations/route.ts` ✅
- `app/api/automations/[id]/route.ts` ✅
- `lib/inngest/functions.ts` ✅
- `app/api/inngest/route.ts` ✅
- `app/dashboard/settings/automations/page.tsx` ✅

---

#### 2. Recurring Cards ✅ COMPLETE
**Purpose:** Create visitor follow-up templates that automatically generate new cards on a schedule.

**Tasks:**
- [x] Create `recurring_visitor_templates` and `recurring_instances` tables
- [x] Create API routes for template CRUD operations
- [x] Create Inngest cron job to generate recurring cards
- [x] Support daily, weekly, and monthly recurrence patterns
- [x] Track generated instances to prevent duplicates

**Files:**
- `scripts/115-create-recurring-cards-tables.sql` ✅
- `app/api/recurring-templates/route.ts` ✅
- `app/api/recurring-templates/[id]/route.ts` ✅
- `lib/inngest/functions.ts` ✅
- `app/api/inngest/route.ts` ✅

---

#### 3. @Mentions ✅ COMPLETE
**Purpose:** Tag team members in comments to notify them and draw their attention.

**Tasks:**
- [x] Create `comment_mentions` table
- [x] Update comments API to parse and store mentions
- [x] Create team members API endpoint for autocomplete
- [x] Add @mention autocomplete to comment input
- [x] Render mentions as highlighted text in comments

**Files:**
- `scripts/116-create-comment-mentions-table.sql` ✅
- `app/api/visitors/[id]/comments/route.ts` ✅
- `app/api/team-members/route.ts` ✅
- `components/visitors/visitor-comments.tsx` ✅

---

#### 4. Time Tracking ✅ COMPLETE
**Purpose:** Track time spent on visitor follow-ups for reporting and accountability.

**Tasks:**
- [x] Create `visitor_time_entries` table
- [x] Create API routes for time entry CRUD operations
- [x] Create time tracking component with live timer
- [x] Support manual time entry with start/end times
- [x] Add activity type categorization
- [x] Add Time tab to visitor detail modal

**Files:**
- `scripts/117-create-time-tracking-tables.sql` ✅
- `app/api/visitors/[id]/time-entries/route.ts` ✅
- `app/api/visitors/[id]/time-entries/[entryId]/route.ts` ✅
- `components/visitors/visitor-time-tracking.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅

---

#### 5. Checklists ✅ COMPLETE
**Purpose:** Add sub-tasks to visitor cards for onboarding workflows (e.g., "Send welcome email", "Schedule coffee").

**Tasks:**
- [x] Create `visitor_checklist_items` table
- [x] Create API routes for checklist item CRUD operations
- [x] Create checklist component with progress bar
- [x] Support reordering checklist items
- [x] Add Checklist tab to visitor detail modal

**Files:**
- `scripts/118-create-visitor-checklists-tables.sql` ✅
- `app/api/visitors/[id]/checklist/route.ts` ✅
- `app/api/visitors/[id]/checklist/[itemId]/route.ts` ✅
- `components/visitors/visitor-checklist.tsx` ✅
- `components/visitors/visitor-detail-modal.tsx` ✅

---

## Phase 3: Advanced ✅ COMPLETE

**Goal:** Add advanced project management and analytics features.

### Features

#### 1. Advanced Filters ✅ COMPLETE
**Purpose:** Enable complex filtering and search to find specific visitors quickly.

**Tasks:**
- [x] Create saved_filters table
- [x] Create filter builder UI component
- [x] Create API routes for filter operations
- [x] Add full-text search across visitor data
- [x] Support multiple filter conditions
- [x] Add saved filter presets

**Files:**
- `scripts/119-create-saved-filters-table.sql` ✅
- `app/api/visitors/search/route.ts` ✅
- `app/api/saved-filters/route.ts` ✅
- `app/api/saved-filters/[id]/route.ts` ✅
- `components/visitors/advanced-filter-builder.tsx` ✅
- `components/visitors/saved-filters.tsx` ✅

---

#### 2. Analytics Dashboard ✅ COMPLETE
**Purpose:** Visualize visitor pipeline metrics, conversion rates, and team performance.

**Tasks:**
- [x] Create analytics dashboard page
- [x] Add visitor pipeline funnel chart
- [x] Add conversion rate metrics
- [x] Add team performance metrics
- [x] Add time-based trend analysis
- [x] Create analytics API routes

**Files:**
- `app/dashboard/analytics/page.tsx` ✅
- `app/api/analytics/visitors/route.ts` ✅
- `app/api/analytics/team/route.ts` ✅
- `components/analytics/visitor-funnel-chart.tsx` ✅
- `components/analytics/conversion-metrics.tsx` ✅
- `components/analytics/team-performance.tsx` ✅

---

#### 3. Dependencies ✅ COMPLETE
**Purpose:** Link visitors together to show relationships (family members, blocked by, etc.).

**Tasks:**
- [x] Create visitor_dependencies table
- [x] Create API routes for dependency CRUD operations
- [x] Add dependency types (related to, blocked by, family member)
- [x] Create dependency selector component
- [x] Add visual indicators on cards
- [x] Create dependency graph view

**Files:**
- `scripts/120-create-visitor-dependencies-table.sql` ✅
- `app/api/visitors/[id]/dependencies/route.ts` ✅
- `app/api/visitors/[id]/dependencies/[dependencyId]/route.ts` ✅
- `components/visitors/dependency-selector.tsx` ✅
- `components/visitors/dependency-graph.tsx` ✅

---

#### 4. Board Templates ✅ COMPLETE
**Purpose:** Create reusable board configurations with pre-defined settings.

**Tasks:**
- [x] Create board_templates table
- [x] Create API routes for template CRUD operations
- [x] Create template builder UI
- [x] Support exporting current board as template
- [x] Support importing template to new tenant
- [x] Add template management page

**Files:**
- `scripts/121-create-board-templates-table.sql` ✅
- `app/api/board-templates/route.ts` ✅
- `app/api/board-templates/[id]/route.ts` ✅
- `app/api/board-templates/[id]/apply/route.ts` ✅
- `app/dashboard/settings/board-templates/page.tsx` ✅
- `components/board-templates/template-builder.tsx` ✅

---

#### 5. Advanced Integrations ✅ COMPLETE
**Purpose:** Connect to external tools to sync data and automate workflows.

**Tasks:**
- [x] Create integration API foundation
- [x] Add Google Calendar sync capability
- [x] Add email integration (Resend)
- [x] Add SMS integration (Telnyx)
- [x] Create integration settings page
- [x] Add integration activity logging

**Files:**
- `app/api/integrations/google-calendar/auth/route.ts` ✅
- `app/api/integrations/google-calendar/sync/route.ts` ✅
- `app/api/visitors/[id]/email/route.ts` ✅
- `app/api/visitors/[id]/sms/route.ts` ✅
- `components/integrations/email-composer.tsx` ✅
- `components/integrations/sms-composer.tsx` ✅

---

## Progress Summary

- **Phase 1:** 5/5 features complete (100%) ✅
- **Phase 2:** 5/5 features complete (100%) ✅
- **Phase 3:** 5/5 features complete (100%) ✅

**Last Updated:** 2025-10-27

---

## Deployment Instructions

### Phase 1, 2 & 3 Deployment

Run SQL scripts in order:
\`\`\`bash
# Phase 1 scripts
scripts/109-add-due-dates-to-visitors.sql
scripts/110-create-visitor-comments-table.sql
scripts/111-create-visitor-attachments-table.sql
scripts/112-create-visitor-labels-tables.sql
scripts/113-create-custom-fields-tables.sql

# Phase 2 scripts
scripts/114-create-automations-tables.sql
scripts/115-create-recurring-cards-tables.sql
scripts/116-create-comment-mentions-table.sql
scripts/117-create-time-tracking-tables.sql
scripts/118-create-visitor-checklists-tables.sql

# Phase 3 scripts
scripts/119-create-saved-filters-table.sql
scripts/120-create-visitor-dependencies-table.sql
scripts/121-create-board-templates-table.sql
scripts/122-add-rls-policies-phase-3.sql
\`\`\`

Deploy the application to Vercel and test all features.

**Note:** Inngest is already configured via the `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` environment variables.
