# Giving System Integration Plan
**Daily One Accord - Stripe-Powered Church Giving Platform**

## Executive Summary

This plan outlines the implementation of a comprehensive giving system that allows each church to connect their own Stripe account, accept donations with customizable giving options, and access detailed financial analytics and reporting. The system will be fully integrated into the existing Daily One Accord platform with proper multi-tenant isolation, role-based access control, and menu visibility options.

**Key Privacy Principle:** Each church tenant has exclusive access to their own donor data. Daily One Accord (platform/super admin) does NOT have access to individual church donor information, ensuring complete data privacy and ownership.

---

## Table of Contents

1. [Overview & Goals](#overview--goals)
2. [Data Privacy & Access Control](#data-privacy--access-control)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Feature Specifications](#feature-specifications)
6. [User Interface & Experience](#user-interface--experience)
7. [Analytics & Reporting](#analytics--reporting)
8. [Security & Compliance](#security--compliance)
9. [Implementation Checklist](#implementation-checklist)
10. [Testing Strategy](#testing-strategy)
11. [Future Enhancements](#future-enhancements)

---

## Overview & Goals

### Primary Objectives

1. **Multi-Tenant Stripe Integration**: Each church connects their own Stripe account via Stripe Connect
2. **Complete Data Privacy**: Churches own and control all donor data - platform never accesses it
3. **Flexible Giving Options**: Support one-time gifts, recurring donations, campaigns, and designated funds
4. **Donor Management**: Track donor information, giving history, and engagement (church-only access)
5. **Financial Analytics**: Comprehensive reporting on giving trends, donor retention, and campaign performance
6. **Customizable Experience**: Churches can customize giving forms, amounts, and branding
7. **Seamless Integration**: Fully integrated with existing church management features

### Success Metrics

- Churches can connect Stripe account in < 5 minutes
- Donors can complete a gift in < 2 minutes
- 100% transaction tracking and reconciliation
- Real-time analytics dashboard
- PCI compliance maintained (Stripe handles all card data)
- Zero platform access to donor data

---

## Data Privacy & Access Control

### Access Model

**Church Tenant Access (Full Control):**
- ✅ View all their donors
- ✅ View all their donations
- ✅ Manage their funds and campaigns
- ✅ Access their giving analytics
- ✅ Export their donor data
- ✅ Configure their giving settings
- ✅ Receive funds directly to their Stripe account

**Daily One Accord Platform (No Donor Access):**
- ❌ Cannot view donor information
- ❌ Cannot view donation details
- ❌ Cannot access giving analytics
- ✅ Can view Stripe connection status (connected/disconnected)
- ✅ Can provide technical support for connection issues
- ✅ Can view aggregate platform metrics (total churches with giving enabled)

### Why This Matters

**Data Ownership:**
- Churches own their donor relationships
- Donor data stays with the church
- No platform lock-in for donor information
- Churches can export and migrate their data anytime

**Trust & Compliance:**
- Donors trust the church, not the platform
- Simplified privacy policies
- Reduced liability for platform
- Easier GDPR/privacy compliance

**Financial Independence:**
- Funds go directly to church's Stripe account
- Church controls refunds and disputes
- Church receives Stripe payouts directly
- No platform fees on donations

---

## Technical Architecture

### Integration Pattern: Stripe Connect

We'll use **Stripe Connect** (Standard accounts) to allow each church to:
- Connect their own Stripe account
- Receive funds directly to their bank account
- Maintain their own Stripe dashboard access
- Handle their own refunds and disputes
- Own all customer/donor data in their Stripe account

**Why Stripe Connect?**
- Churches own their Stripe account and data
- Direct deposits to church bank accounts
- No platform fees (churches pay standard Stripe rates)
- Full transparency and control
- Simplified tax reporting (1099s go directly to churches)
- Platform never touches donor payment information

### System Components & Data Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Daily One Accord Platform                 │
│                  (NO ACCESS TO DONOR DATA)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Stripe Connection Management                  │   │
│  │  (Only stores: account_id, status, church_tenant_id) │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Stripe Connect API      │
              │  (OAuth & Account Info)   │
              └─────────────┬─────────────┘
                            │
         ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
         ┃                                      ┃
    ┌────▼─────┐                          ┌────▼─────┐
    │ Church A │                          │ Church B │
    │  Tenant  │                          │  Tenant  │
    └────┬─────┘                          └────┬─────┘
         │                                      │
         │ RLS: Only Church A data              │ RLS: Only Church B data
         │                                      │
    ┌────▼──────────────────┐            ┌────▼──────────────────┐
    │  Church A Database    │            │  Church B Database    │
    │  - donors             │            │  - donors             │
    │  - donations          │            │  - donations          │
    │  - funds              │            │  - funds              │
    │  - campaigns          │            │  - campaigns          │
    │  - analytics          │            │  - analytics          │
    └────┬──────────────────┘            └────┬──────────────────┘
         │                                      │
    ┌────▼─────┐                          ┌────▼─────┐
    │ Church A │                          │ Church B │
    │  Stripe  │                          │  Stripe  │
    │ Account  │                          │ Account  │
    │          │                          │          │
    │ (Donors, │                          │ (Donors, │
    │ Payments,│                          │ Payments,│
    │ Payouts) │                          │ Payouts) │
    └──────────┘                          └──────────┘
\`\`\`

**Key Principles:**
1. **Multi-tenant isolation via RLS**: Each church can ONLY access their own data
2. **No cross-tenant queries**: Platform cannot query across church tenants for donor data
3. **Stripe owns payment data**: All card/payment info stays in Stripe, never in our database
4. **Church owns donor relationships**: Donor data belongs to the church, not the platform

---

## Table of Contents

1. [Overview & Goals](#overview--goals)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [Feature Specifications](#feature-specifications)
5. [User Interface & Experience](#user-interface--experience)
6. [Analytics & Reporting](#analytics--reporting)
7. [Security & Compliance](#security--compliance)
8. [Implementation Checklist](#implementation-checklist)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## Overview & Goals

### Primary Objectives

1. **Multi-Tenant Stripe Integration**: Each church connects their own Stripe account via Stripe Connect
2. **Flexible Giving Options**: Support one-time gifts, recurring donations, campaigns, and designated funds
3. **Donor Management**: Track donor information, giving history, and engagement
4. **Financial Analytics**: Comprehensive reporting on giving trends, donor retention, and campaign performance
5. **Customizable Experience**: Churches can customize giving forms, amounts, and branding
6. **Seamless Integration**: Fully integrated with existing church management features

### Success Metrics

- Churches can connect Stripe account in < 5 minutes
- Donors can complete a gift in < 2 minutes
- 100% transaction tracking and reconciliation
- Real-time analytics dashboard
- PCI compliance maintained (Stripe handles all card data)

---

## Technical Architecture

### Integration Pattern: Stripe Connect

We'll use **Stripe Connect** (Standard accounts) to allow each church to:
- Connect their own Stripe account
- Receive funds directly to their bank account
- Maintain their own Stripe dashboard access
- Handle their own refunds and disputes

**Why Stripe Connect?**
- Churches own their Stripe account and data
- Direct deposits to church bank accounts
- No platform fees (churches pay standard Stripe rates)
- Full transparency and control
- Simplified tax reporting (1099s go directly to churches)

### System Components

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Daily One Accord Platform                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Giving     │  │   Donor      │  │  Analytics   │      │
│  │   Portal     │  │  Management  │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Giving System  │                        │
│                   │   API Layer     │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Stripe Connect  │
                    │   Integration   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
         ┌────▼─────┐                 ┌────▼─────┐
         │ Church A │                 │ Church B │
         │  Stripe  │                 │  Stripe  │
         │ Account  │                 │ Account  │
         └──────────┘                 └──────────┘
\`\`\`

---

## Database Schema

### New Tables

#### 1. `stripe_connections`
Stores Stripe Connect account information for each church.

\`\`\`sql
CREATE TABLE stripe_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE, -- Stripe Connect account ID
  stripe_account_type TEXT NOT NULL DEFAULT 'standard', -- standard, express, custom
  is_active BOOLEAN DEFAULT true,
  is_charges_enabled BOOLEAN DEFAULT false,
  is_payouts_enabled BOOLEAN DEFAULT false,
  country TEXT,
  currency TEXT DEFAULT 'usd',
  business_name TEXT,
  support_email TEXT,
  support_phone TEXT,
  statement_descriptor TEXT, -- Appears on donor's credit card statement
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id) -- One Stripe account per church
);

CREATE INDEX idx_stripe_connections_tenant ON stripe_connections(church_tenant_id);
CREATE INDEX idx_stripe_connections_account ON stripe_connections(stripe_account_id);
\`\`\`

#### 2. `giving_funds`
Designated funds that donors can give to (e.g., "General Fund", "Building Fund", "Missions").

\`\`\`sql
CREATE TABLE giving_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount INTEGER, -- In cents
  current_amount INTEGER DEFAULT 0, -- In cents, updated via trigger
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon name for UI
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

CREATE INDEX idx_giving_funds_tenant ON giving_funds(church_tenant_id);
CREATE INDEX idx_giving_funds_active ON giving_funds(church_tenant_id, is_active) WHERE is_active = true;
\`\`\`

#### 3. `giving_campaigns`
Special fundraising campaigns with goals and deadlines.

\`\`\`sql
CREATE TABLE giving_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount INTEGER NOT NULL, -- In cents
  current_amount INTEGER DEFAULT 0, -- In cents, updated via trigger
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  thank_you_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_giving_campaigns_tenant ON giving_campaigns(church_tenant_id);
CREATE INDEX idx_giving_campaigns_active ON giving_campaigns(church_tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_giving_campaigns_dates ON giving_campaigns(church_tenant_id, start_date, end_date);
\`\`\`

#### 4. `donors`
Donor profiles (separate from church members to handle anonymous/guest donors).

\`\`\`sql
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- NULL for guest donors
  stripe_customer_id TEXT, -- Stripe Customer ID for recurring donations
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  is_anonymous BOOLEAN DEFAULT false,
  total_given INTEGER DEFAULT 0, -- In cents, lifetime total
  first_gift_date TIMESTAMPTZ,
  last_gift_date TIMESTAMPTZ,
  gift_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, email)
);

CREATE INDEX idx_donors_tenant ON donors(church_tenant_id);
CREATE INDEX idx_donors_user ON donors(user_id);
CREATE INDEX idx_donors_email ON donors(church_tenant_id, email);
CREATE INDEX idx_donors_stripe_customer ON donors(stripe_customer_id);
\`\`\`

#### 5. `donations`
Individual donation transactions.

\`\`\`sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES giving_funds(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES giving_campaigns(id) ON DELETE SET NULL,
  
  -- Stripe data
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded, disputed
  payment_method TEXT, -- card, bank_account, etc.
  card_brand TEXT, -- visa, mastercard, etc.
  card_last4 TEXT,
  
  -- Donation details
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT, -- monthly, weekly, yearly
  recurring_subscription_id TEXT, -- Stripe Subscription ID
  is_anonymous BOOLEAN DEFAULT false,
  donor_note TEXT,
  internal_note TEXT, -- Staff notes
  
  -- Fees and net amount
  stripe_fee INTEGER DEFAULT 0, -- In cents
  net_amount INTEGER, -- amount - stripe_fee
  
  -- Metadata
  donation_date TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_tenant ON donations(church_tenant_id);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_fund ON donations(fund_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(church_tenant_id, status);
CREATE INDEX idx_donations_date ON donations(church_tenant_id, donation_date DESC);
CREATE INDEX idx_donations_stripe_intent ON donations(stripe_payment_intent_id);
CREATE INDEX idx_donations_recurring ON donations(church_tenant_id, is_recurring) WHERE is_recurring = true;
\`\`\`

#### 6. `recurring_donations`
Manages recurring donation schedules.

\`\`\`sql
CREATE TABLE recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES giving_funds(id) ON DELETE SET NULL,
  
  -- Stripe subscription data
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Recurring details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT DEFAULT 'usd',
  interval TEXT NOT NULL, -- day, week, month, year
  interval_count INTEGER DEFAULT 1, -- e.g., every 2 weeks
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, canceled, past_due
  
  -- Schedule
  start_date TIMESTAMPTZ NOT NULL,
  next_payment_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ, -- NULL for indefinite
  
  -- Tracking
  total_donations INTEGER DEFAULT 0, -- Count of successful donations
  total_amount INTEGER DEFAULT 0, -- In cents, total given through this subscription
  last_donation_date TIMESTAMPTZ,
  
  -- Cancellation
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_donations_tenant ON recurring_donations(church_tenant_id);
CREATE INDEX idx_recurring_donations_donor ON recurring_donations(donor_id);
CREATE INDEX idx_recurring_donations_status ON recurring_donations(church_tenant_id, status);
CREATE INDEX idx_recurring_donations_next_payment ON recurring_donations(next_payment_date) WHERE status = 'active';
\`\`\`

#### 7. `giving_settings`
Church-specific giving configuration.

\`\`\`sql
CREATE TABLE giving_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  -- Branding
  primary_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,
  header_image_url TEXT,
  thank_you_message TEXT DEFAULT 'Thank you for your generous gift!',
  
  -- Suggested amounts
  suggested_amounts INTEGER[] DEFAULT ARRAY[2500, 5000, 10000, 25000], -- In cents
  allow_custom_amount BOOLEAN DEFAULT true,
  minimum_amount INTEGER DEFAULT 100, -- In cents ($1.00)
  
  -- Features
  allow_recurring BOOLEAN DEFAULT true,
  allow_anonymous BOOLEAN DEFAULT true,
  require_donor_address BOOLEAN DEFAULT false,
  allow_donor_notes BOOLEAN DEFAULT true,
  
  -- Email notifications
  send_donor_receipt BOOLEAN DEFAULT true,
  send_admin_notification BOOLEAN DEFAULT true,
  admin_notification_email TEXT,
  receipt_from_name TEXT,
  receipt_from_email TEXT,
  
  -- Public giving page
  is_public_page_enabled BOOLEAN DEFAULT true,
  public_page_slug TEXT UNIQUE,
  public_page_title TEXT,
  public_page_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id)
);

CREATE INDEX idx_giving_settings_tenant ON giving_settings(church_tenant_id);
CREATE INDEX idx_giving_settings_slug ON giving_settings(public_page_slug) WHERE public_page_slug IS NOT NULL;
\`\`\`

### Database Triggers

#### Update fund/campaign totals when donation is created/updated

\`\`\`sql
CREATE OR REPLACE FUNCTION update_giving_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update fund total
  IF NEW.fund_id IS NOT NULL AND NEW.status = 'succeeded' THEN
    UPDATE giving_funds
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE fund_id = NEW.fund_id
        AND status = 'succeeded'
    )
    WHERE id = NEW.fund_id;
  END IF;
  
  -- Update campaign total
  IF NEW.campaign_id IS NOT NULL AND NEW.status = 'succeeded' THEN
    UPDATE giving_campaigns
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE campaign_id = NEW.campaign_id
        AND status = 'succeeded'
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Update donor totals
  UPDATE donors
  SET 
    total_given = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE donor_id = NEW.donor_id
        AND status = 'succeeded'
    ),
    gift_count = (
      SELECT COUNT(*)
      FROM donations
      WHERE donor_id = NEW.donor_id
        AND status = 'succeeded'
    ),
    last_gift_date = NEW.donation_date,
    first_gift_date = COALESCE(first_gift_date, NEW.donation_date)
  WHERE id = NEW.donor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_giving_totals
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_giving_totals();
\`\`\`

### Row Level Security (RLS) Policies

**Critical: All giving tables MUST have RLS policies that:**
1. Restrict access to `church_tenant_id` matching user's tenant
2. Prevent super_admin from accessing donor data
3. Allow only church admins/staff to view their own data

**Example RLS Policy:**
\`\`\`sql
-- Donors table - Church tenant access only
CREATE POLICY "Church can view own donors"
ON donors FOR SELECT
USING (
  church_tenant_id IN (
    SELECT church_tenant_id 
    FROM user_church_roles 
    WHERE user_id = auth.uid()
  )
);

-- Explicitly DENY super admin access to donor data
CREATE POLICY "Super admin cannot view donors"
ON donors FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);
\`\`\`

**Apply similar policies to:**
- `donors`
- `donations`
- `giving_funds`
- `giving_campaigns`
- `recurring_donations`
- `giving_settings`

**Exception: `stripe_connections` table**
- Super admin CAN view connection status for support purposes
- Super admin CANNOT view donor/donation data
- Only stores: account_id, status, church_tenant_id (no sensitive data)

---

## Feature Specifications

### Phase 1: Core Giving System

#### 1.1 Stripe Connect Onboarding

**Admin Flow:**
1. Navigate to Settings > Giving > Connect Stripe
2. Click "Connect with Stripe" button
3. Redirected to Stripe Connect OAuth flow
4. Authorize Daily One Accord to access Stripe account
5. Redirected back with authorization code
6. System exchanges code for Stripe account ID
7. Store connection in `stripe_connections` table
8. Display success message with account status

**Technical Implementation:**
- Use Stripe Connect Standard accounts
- OAuth flow with proper redirect URLs
- Webhook handlers for account updates
- Status monitoring (charges_enabled, payouts_enabled)

#### 1.2 Fund Management

**Features:**
- Create/edit/delete designated funds
- Set fund goals and track progress
- Reorder funds for display priority
- Mark default fund
- Assign colors and icons for visual identification

**UI Components:**
- Fund list with drag-and-drop reordering
- Fund creation modal
- Progress bars showing goal completion
- Fund selector in donation form

#### 1.3 Donation Processing

**One-Time Donations:**
- Embedded Stripe Checkout or Payment Element
- Support for cards, Apple Pay, Google Pay
- Custom amount or suggested amounts
- Fund selection
- Optional donor information
- Anonymous giving option
- Donor notes

**Recurring Donations:**
- Same UI as one-time with frequency selector
- Create Stripe Subscription
- Manage subscription (pause, cancel, update amount)
- Email reminders before charge
- Failed payment retry logic

**Technical Flow:**
\`\`\`
1. Donor fills out form
2. Create/retrieve Stripe Customer
3. Create Payment Intent (one-time) or Subscription (recurring)
4. Stripe processes payment
5. Webhook confirms success
6. Create donation record
7. Update totals (triggers)
8. Send receipt email
9. Notify admins (optional)
\`\`\`

#### 1.4 Donor Management

**Features:**
- Donor directory with search/filter
- Donor profile with giving history
- Lifetime giving total
- First/last gift dates
- Contact information
- Merge duplicate donors
- Export donor list
- Tag donors (VIP, major donor, etc.)

**Donor Profile View:**
- Personal information
- Giving history table
- Giving trends chart
- Recurring donations list
- Notes/interactions log
- Communication preferences

### Phase 2: Core Giving - COMPLETE

#### 2.1 Build Donation Form Component

**Features:**
- Customizable donation form builder
- Multiple forms for different purposes
- Embeddable forms (iframe/widget)
- Public giving page with church branding
- QR codes for in-person giving
- Text-to-give integration (future)

**Form Customization:**
- Custom fields
- Conditional logic
- Multi-step forms
- Custom thank you pages
- Redirect after donation

#### 2.2 Implement Stripe Payment Element

**Features:**
- Support for cards, Apple Pay, Google Pay
- Custom amount or suggested amounts
- Fund selection
- Optional donor information
- Anonymous giving option
- Donor notes

#### 2.3 Create Donation Processing API

**Features:**
- Process one-time and recurring donations
- Handle payment intents and subscriptions
- Update donation status based on webhook events

#### 2.4 Set Up Stripe Webhooks

**Features:**
- Handle account updates
- Process successful payments
- Update donation records
- Send receipt emails
- Notify admins of donations

#### 2.5 Build Donor Management UI

**Features:**
- Donor directory with search/filter
- Donor profile with giving history
- Lifetime giving total
- First/last gift dates
- Contact information
- Merge duplicate donors
- Export donor list
- Tag donors (VIP, major donor, etc.)

#### 2.6 Implement Donation List/Detail Views

**Features:**
- Searchable/filterable table
- Columns: Date, Donor, Amount, Fund, Status, Actions
- Filters: Date range, fund, campaign, status, payment method
- Bulk actions: Export, send receipts
- Quick view modal for donation details

#### 2.7 Create Email Receipt System

**Features:**
- Send automated donation receipts to donors
- Customize email templates
- Handle email delivery failures

#### 2.8 Public Giving Page (`/give/[churchSlug]`)

**Features:**
- Church branding
- Fund selector
- Amount selector (suggested + custom)
- Recurring option
- Donor information form
- Stripe payment element
- Thank you page

**Mobile Optimized:**
- Responsive design
- Touch-friendly
- Fast loading
- Apple Pay/Google Pay support

### Phase 3: Recurring Giving - COMPLETE

#### 3.1 Implement Stripe Subscriptions

**Features:**
- Create and manage recurring donations
- Handle subscription status changes
- Process failed payments and retries

#### 3.2 Build Recurring Donation UI

**Features:**
- View active subscriptions
- Update payment method
- Change donation amount
- Pause/resume subscription
- Cancel subscription
- Download receipts

#### 3.3 Create Subscription Management

**Features:**
- Admin tools for managing subscriptions
- Failed payment alerts
- Subscription health metrics
- Churn analysis
- Retention campaigns

#### 3.4 Build Donor Portal for Subscriptions

**Features:**
- Donor-facing portal for managing subscriptions
- View subscription history
- Update payment information
- Cancel subscriptions
- Download receipts

#### 3.5 Implement Failed Payment Handling

**Features:**
- Detect and handle failed payments
- Send notifications to donors
- Retry failed payments

#### 3.6 Create Subscription Analytics

**Features:**
- Analyze subscription performance
- Track MRR
- Identify churn
- Build retention campaigns

### Phase 4: Campaigns - COMPLETE

#### 4.1 Build Campaign Management UI

**Features:**
- Campaign list with search/filter
- Campaign creation modal
- Progress bars showing goal completion
- Campaign selector in donation form

#### 4.2 Create Campaign Landing Pages

**Features:**
- Customizable landing pages for each campaign
- Church branding
- Fund selector
- Amount selector (suggested + custom)
- Recurring option
- Donor information form
- Stripe payment element
- Thank you page

#### 4.3 Implement Campaign Progress Tracking

**Features:**
- Real-time updates on campaign progress
- Goal completion alerts
- Analytics dashboard for campaign performance

#### 4.4 Build Campaign Analytics

**Features:**
- Detailed analytics on campaign performance
- Charts and graphs showing donation trends
- Comparison of campaign goals vs actual giving

#### 4.5 Create Campaign Sharing Tools

**Features:**
- Social media sharing buttons
- Email sharing links
- QR codes for campaign pages
- Analytics on shared campaign performance

### Phase 5: Analytics & Reporting - COMPLETE

#### 5.1 Build Analytics Dashboard

**Features:**
- Real-time metrics (total giving, donor count, average gift size, MRR, conversion rate)
- Trend analysis charts (giving over time, donor growth, recurring vs one-time giving, giving by fund distribution, campaign progress tracking)
- Donor insights metrics (donor retention rate, lifetime value, giving frequency, lapsed donor rate, major donor concentration)
- Financial reports (year-end statements, IRS-compliant receipts, non-deductible gift tracking, goods/services value disclosure, 501(c)(3) information display)

#### 5.2 Create Financial Reports

**Features:**
- Automated generation for all donors
- PDF format with church branding
- IRS-compliant format
- Bulk email delivery
- Download individual statements

#### 5.3 Implement Donor Insights

**Features:**
- Detailed insights on donor behavior and engagement
- Segmentation by giving tier, recency, and tags
- Visualizations and dashboards for easy interpretation

#### 5.4 Build Year-End Statement Generator

**Features:**
- Automated generation of year-end giving statements
- Compliance with IRS requirements
- Church branding options
- Bulk email delivery for easy distribution

#### 5.5 Create Export Functionality

**Features:**
- Export donation data for accounting software
- Export donor information for GDPR compliance
- Customizable export formats (CSV, Excel, PDF)

---

## User Interface & Experience

### Navigation Structure

**New Sidebar Menu Item:**
\`\`\`
📊 Giving
  ├── Dashboard (overview)
  ├── Donations (transaction list)
  ├── Donors (donor directory)
  ├── Funds (fund management)
  ├── Campaigns (campaign management)
  ├── Recurring (subscription management)
  ├── Reports (financial reports)
  └── Settings (giving configuration)
\`\`\`

**Menu Visibility:**
- Add "giving" menu item to menu registry
- Default roles: lead_admin, admin
- Configurable via menu visibility settings

### Key Pages

#### 1. Giving Dashboard (`/dashboard/giving`)

**Layout:**
- Hero stats (4 metric cards)
- Giving trends chart
- Recent donations table
- Top donors list
- Fund progress bars
- Active campaigns

#### 2. Donations List (`/dashboard/giving/donations`)

**Features:**
- Searchable/filterable table
- Columns: Date, Donor, Amount, Fund, Status, Actions
- Filters: Date range, fund, campaign, status, payment method
- Bulk actions: Export, send receipts
- Quick view modal for donation details

#### 3. Donor Directory (`/dashboard/giving/donors`)

**Features:**
- Card/table view toggle
- Search by name/email
- Filter by giving tier, recency, tags
- Sort by total given, last gift, etc.
- Donor profile modal/page
- Add donor manually
- Import donors (CSV)

#### 4. Fund Management (`/dashboard/giving/funds`)

**Features:**
- Fund cards with progress bars
- Drag-and-drop reordering
- Create/edit fund modal
- Fund analytics (click to expand)
- Archive inactive funds

#### 5. Campaign Management (`/dashboard/giving/campaigns`)

**Features:**
- Campaign cards with progress
- Create campaign wizard
- Campaign detail page
- Campaign analytics
- Share campaign tools
- Campaign updates/posts

#### 6. Giving Settings (`/dashboard/giving/settings`)

**Tabs:**
- Stripe Connection
- Branding & Appearance
- Suggested Amounts
- Email Templates
- Public Giving Page
- Notifications
- Advanced Settings

### Donor-Facing Pages

#### Public Giving Page (`/give/[churchSlug]`)

**Features:**
- Church branding
- Fund selector
- Amount selector (suggested + custom)
- Recurring option
- Donor information form
- Stripe payment element
- Thank you page

**Mobile Optimized:**
- Responsive design
- Touch-friendly
- Fast loading
- Apple Pay/Google Pay support

---

## Analytics & Reporting

### Real-Time Metrics

**Dashboard KPIs:**
- Total giving (with comparison to previous period)
- Donor count (with new donor count)
- Average gift size
- Recurring revenue (MRR)
- Conversion rate (visitors to donors)

### Trend Analysis

**Charts:**
- Giving over time (daily, weekly, monthly, yearly)
- Donor growth over time
- Recurring vs one-time giving
- Giving by fund distribution
- Campaign progress tracking

### Donor Insights

**Metrics:**
- Donor retention rate (% of donors who give again)
- Donor lifetime value (average total giving per donor)
- Giving frequency (average gifts per donor per year)
- Lapsed donor rate (% who haven't given in 12 months)
- Major donor concentration (% of giving from top 10%)

### Financial Reports

**Year-End Statements:**
- Automated generation for all donors
- PDF format with church branding
- IRS-compliant format
- Bulk email delivery
- Download individual statements

**Reconciliation:**
- Match donations to Stripe payouts
- Track fees and net amounts
- Identify discrepancies
- Export for accounting software

---

## Security & Compliance

### PCI Compliance

**Stripe Handles:**
- All card data collection
- PCI DSS compliance
- Secure payment processing
- Fraud detection
- 3D Secure authentication

**We Never Store:**
- Full credit card numbers
- CVV codes
- Expiration dates (except month/year for display)

### Data Security

**Encryption:**
- All data encrypted at rest (Supabase)
- All data encrypted in transit (HTTPS)
- Sensitive fields (notes) encrypted

**Access Control:**
- Row Level Security (RLS) policies
- Multi-tenant isolation
- Role-based permissions
- Audit logging

### Privacy

**Donor Privacy:**
- Anonymous giving option
- Opt-out of donor directory
- GDPR-compliant data export
- Right to be forgotten (data deletion)

**Data Retention:**
- Donation records: 7 years (IRS requirement)
- Donor information: Until requested deletion
- Failed transactions: 90 days
- Audit logs: 1 year

### Tax Compliance

**Features:**
- Year-end giving statements
- IRS-compliant receipts
- Non-deductible gift tracking
- Goods/services value disclosure
- 501(c)(3) information display

---

## Implementation Checklist

### ✅ Phase 1: Foundation - COMPLETE
- [x] Database schema (all 7 tables)
- [x] RLS policies (tenant-isolated, super admin blocked)
- [x] Stripe Connect integration API routes
- [x] Settings page for churches to connect Stripe
- [x] Menu items added to registry
- [x] Basic giving dashboard page
- [x] Fund management UI

### ✅ Phase 2: Core Giving - COMPLETE
- [x] Build donation form component
- [x] Implement Stripe Payment Element
- [x] Create donation processing API
- [x] Set up Stripe webhooks
- [x] Build donor management UI
- [x] Implement donation list/detail views
- [x] Create email receipt system
- [x] Public giving page (`/give/[churchSlug]`)

### ✅ Phase 3: Recurring Giving - COMPLETE
- [x] Implement Stripe Subscriptions
- [x] Build recurring donation UI
- [x] Create subscription management
- [x] Build donor portal for subscriptions
- [x] Implement failed payment handling
- [x] Create subscription analytics

### ✅ Phase 4: Campaigns - COMPLETE
- [x] Build campaign management UI
- [x] Create campaign landing pages
- [x] Implement campaign progress tracking
- [x] Build campaign analytics
- [x] Create campaign sharing tools

### ✅ Phase 5: Analytics & Reporting - COMPLETE
- [x] Build analytics dashboard
- [x] Create financial reports
- [x] Implement donor insights
- [x] Build year-end statement generator
- [x] Create export functionality

### ✅ Phase 6: Polish & Optimization - COMPLETE
- [x] Public giving page optimization
  - Added skeleton loaders for better perceived performance
  - Improved mobile responsiveness with proper touch targets (48px minimum)
  - Enhanced SEO with metadata and Open Graph tags
  - Optimized form layout for mobile devices
- [x] Mobile responsiveness testing
  - Responsive grid layouts with proper breakpoints
  - Touch-friendly buttons and inputs
  - Improved spacing and typography for small screens
- [x] Performance optimization
  - Skeleton loaders replace basic "Loading..." text
  - Lazy loading preparation for charts
  - Client-side validation to reduce server requests
  - Rate limiting on donation endpoint (5 requests/minute per user)
- [x] Security audit
  - Server-side email validation
  - Input sanitization for donor notes (XSS prevention)
  - Maximum donation amount validation ($1M cap)
  - Rate limiting implementation
  - Enhanced error handling with inline display
- [x] Documentation
  - Inline code comments for complex logic
  - JSDoc-style documentation for key functions
  - Security best practices documented
- [x] User testing & feedback
  - Improved error messages (inline instead of alerts)
  - Better loading states with skeletons
  - Clear validation feedback
  - Accessible form labels and ARIA attributes
- [x] Embeddable giving widget
  - Created `/embed/giving/[churchSlug]` route for iframe embedding
  - Built embed code generator with customization options
  - Added to giving settings page for easy access
  - Supports custom colors, header text, and branding
  - Includes WordPress and website integration instructions

---

## Testing Strategy

### Unit Tests

**Coverage:**
- Stripe API integration functions
- Donation processing logic
- Total calculation triggers
- Email sending functions
- Data validation

### Integration Tests

**Scenarios:**
- Complete donation flow (one-time)
- Complete donation flow (recurring)
- Stripe webhook processing
- Fund total updates
- Donor profile creation
- Receipt email delivery

### End-to-End Tests

**User Flows:**
- Church connects Stripe account
- Admin creates fund
- Donor makes one-time gift
- Donor sets up recurring gift
- Admin views donation
- Admin generates report
- Donor manages subscription

### Security Tests

**Checks:**
- RLS policy enforcement
- Multi-tenant isolation
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting

---

## Future Enhancements

### Phase 7+: Advanced Features

**Potential Additions:**
1. **Text-to-Give**: SMS-based giving via Telnyx
2. **Kiosk Mode**: Tablet-based giving stations
3. **Pledge Management**: Track pledges vs actual giving
4. **Matching Gifts**: Corporate matching gift tracking
5. **Stock/Crypto Donations**: Accept non-cash gifts
6. **QuickBooks Integration**: Sync to accounting software
7. **Donor Portal**: Full self-service portal for donors
8. **Giving Statements**: Quarterly statements
9. **Planned Giving**: Estate planning tools
10. **Grant Management**: Track foundation grants

### Integration Opportunities

**Existing Features:**
- Link donations to attendance (identify givers)
- Link donations to events (event-specific giving)
- Link donations to classes (class fees)
- Slack notifications for large gifts
- Email campaigns to lapsed donors

---

## Conclusion

This giving system will provide churches with a comprehensive, easy-to-use platform for accepting and managing donations. By leveraging Stripe Connect and strict RLS policies, we ensure that:

1. **Churches own their data**: Donor information belongs to the church, not the platform
2. **Direct payments**: Funds go straight to church bank accounts
3. **Privacy by design**: Platform cannot access donor data
4. **Full transparency**: Churches see everything, platform sees nothing
5. **Easy migration**: Churches can export and own their data

**This is not a typical SaaS model** - it's a privacy-first, church-owned approach that respects the sacred trust between churches and their donors.

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-28  
**Author:** v0 AI Assistant  
**Status:** Ready for Implementation
