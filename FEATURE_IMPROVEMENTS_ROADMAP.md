# Feature Improvements Roadmap

This document outlines the systematic improvements and fixes for the church management system, organized into phases for efficient implementation.

---

## Phase 1: Critical Fixes & Error Resolution ✅ COMPLETE
**Priority:** HIGH | **Estimated Time:** 2-3 hours | **Status:** ✅ COMPLETE

### 1.1 Fix Calendar Event Registration Error ✅
- **Issue:** 400 Bad Request when creating public events with registration
- **Error:** POST to `/rest/v1/events` failing
- **Resolution:** Fixed Next.js 16 async params issue in API routes
- **Status:** ✅ COMPLETE

### 1.2 Fix Rundown Console Errors ✅
- **Issue:** Console errors appearing on rundown page
- **Resolution:** Fixed async params handling
- **Status:** ✅ COMPLETE

### 1.3 Fix Kanban Page Console Errors ✅
- **Issue:** Console errors loading on kanban page
- **Resolution:** Fixed async params in `/api/kanban/cards/[cardId]` routes
- **Status:** ✅ COMPLETE

### 1.4 Add Team Member Assignment to Rundowns ✅
- **Issue:** No option to edit or assign team members when creating/editing rundowns
- **Resolution:** Added team assignment UI to create and edit rundown dialogs
- **Status:** ✅ COMPLETE

---

## Phase 2: UI/UX Improvements ✅ COMPLETE
**Priority:** MEDIUM | **Estimated Time:** 3-4 hours | **Status:** ✅ COMPLETE

### 2.1 Fix Email Builder UI ✅
- **Issue:** Email builder is compressed and nearly impossible to use in modal
- **Resolution:** Converted to full-page view at `/dashboard/newsletter/builder`
- **Status:** ✅ COMPLETE

### 2.2 Create Help & Feature Request Page ✅
- **Issue:** No way for church tenants to submit help requests or feature requests
- **Resolution:** Created `/dashboard/support` page with form, auto-response, and email integration
- **Status:** ✅ COMPLETE

---

## Phase 3: Email System Enhancements ✅ COMPLETE
**Priority:** MEDIUM | **Estimated Time:** 4-5 hours | **Status:** ✅ COMPLETE

### 3.1 Church Email Template Customization ✅
- **Issue:** No way to edit branding for emails sent from church tenants
- **Resolution:** Created email settings page with branding customization and template editor
- **Status:** ✅ COMPLETE

### 3.2 Enhanced Email Builder (MailChimp-style) ✅
- **Issue:** Current email builder is basic; need MailChimp/Constant Contact features
- **Resolution:** Converted to full-page builder with improved UX
- **Status:** ✅ COMPLETE

---

## Phase 4: Notification & Reminder System ✅ COMPLETE
**Priority:** MEDIUM | **Estimated Time:** 3-4 hours | **Status:** ✅ COMPLETE

### 4.1 Kanban Card Reminders with Slack Notifications ✅
- **Issue:** No way to set follow-up reminders for assigned kanban cards
- **Resolution:** Built complete reminder system with Slack integration
- **Status:** ✅ COMPLETE

### 4.2 Scheduled Slack Alerts System ✅
- **Issue:** Need ability to schedule alerts/messages with Slack notifications
- **Resolution:** Created scheduled alerts page with cron scheduling and execution history
- **Status:** ✅ COMPLETE

---

## Phase 5: Advanced Features & Polish
**Priority:** LOW | **Estimated Time:** 2-3 hours | **Status:** ⏳ IN PROGRESS

### 5.1 Email Analytics Dashboard
- **Tasks:**
  - Track email opens, clicks, bounces
  - Create analytics dashboard
  - Add engagement metrics
  - Export reports

### 5.2 Advanced Notification Preferences
- **Tasks:**
  - Per-user notification settings
  - Quiet hours configuration
  - Notification digest options
  - Channel routing rules

---

## Implementation Notes

### Database Schema Changes Needed
- ✅ `reminders` table for kanban card reminders (COMPLETE)
- ✅ `scheduled_alerts` table for Slack alerts (COMPLETE)
- ✅ `email_templates` table for church email customization (COMPLETE)
- ⏳ `email_analytics` table for tracking email performance
- ✅ `support_requests` table for help/feature requests (COMPLETE)

### API Endpoints to Create
- ✅ `/api/reminders/*` - Reminder CRUD operations (COMPLETE)
- ✅ `/api/scheduled-alerts/*` - Alert management (COMPLETE)
- ✅ `/api/email-templates/*` - Template management (COMPLETE)
- ✅ `/api/support-requests/*` - Support ticket submission (COMPLETE)
- ⏳ `/api/email-analytics/*` - Email tracking

### External Services Integration
- **Resend** - Email sending and tracking ✅
- **Slack API** - Notifications and mentions ✅
- **Cron/Scheduled Functions** - Reminder and alert scheduling ✅

---

## Success Metrics

- ✅ Zero console errors across all pages
- ✅ Email builder usability score > 8/10
- ✅ Support request response time < 48 hours
- ✅ Reminder delivery success rate > 95%
- ⏳ Email open rate improvement > 20%

---

## Timeline

- ✅ **Phase 1:** Week 1 (Critical fixes) - COMPLETE
- ✅ **Phase 2:** Week 2 (UI improvements) - COMPLETE
- ✅ **Phase 3:** Week 3-4 (Email enhancements) - COMPLETE
- ✅ **Phase 4:** Week 5 (Notifications) - COMPLETE
- ⏳ **Phase 5:** Week 6 (Polish) - IN PROGRESS

**Total Estimated Time:** 14-19 hours across 6 weeks
