-- =====================================================
-- GIVING SYSTEM - DATABASE SCHEMA
-- Phase 1: Foundation & Database
-- =====================================================
-- This script creates the complete giving system schema
-- with strict RLS policies ensuring tenant isolation
-- and NO super admin access to donor data.
-- =====================================================

-- =====================================================
-- 1. STRIPE CONNECTIONS TABLE
-- =====================================================
-- Stores Stripe Connect account information for each church
-- Super admin CAN view this for support (no sensitive data)

CREATE TABLE IF NOT EXISTS stripe_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  stripe_account_type TEXT NOT NULL DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  is_charges_enabled BOOLEAN DEFAULT false,
  is_payouts_enabled BOOLEAN DEFAULT false,
  country TEXT,
  currency TEXT DEFAULT 'usd',
  business_name TEXT,
  support_email TEXT,
  support_phone TEXT,
  statement_descriptor TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_connections_tenant ON stripe_connections(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connections_account ON stripe_connections(stripe_account_id);

COMMENT ON TABLE stripe_connections IS 'Stripe Connect account information - super admin can view for support';

-- =====================================================
-- 2. GIVING FUNDS TABLE
-- =====================================================
-- Designated funds that donors can give to

CREATE TABLE IF NOT EXISTS giving_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount INTEGER,
  current_amount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  color TEXT,
  icon TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_giving_funds_tenant ON giving_funds(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_giving_funds_active ON giving_funds(church_tenant_id, is_active) WHERE is_active = true;

COMMENT ON TABLE giving_funds IS 'Designated funds for donations - church tenant access only';

-- =====================================================
-- 3. GIVING CAMPAIGNS TABLE
-- =====================================================
-- Special fundraising campaigns with goals and deadlines

CREATE TABLE IF NOT EXISTS giving_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  thank_you_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giving_campaigns_tenant ON giving_campaigns(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_giving_campaigns_active ON giving_campaigns(church_tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_giving_campaigns_dates ON giving_campaigns(church_tenant_id, start_date, end_date);

COMMENT ON TABLE giving_campaigns IS 'Fundraising campaigns - church tenant access only';

-- =====================================================
-- 4. DONORS TABLE
-- =====================================================
-- Donor profiles (separate from church members)
-- CRITICAL: Super admin CANNOT access this table

CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  stripe_customer_id TEXT,
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
  total_given INTEGER DEFAULT 0,
  first_gift_date TIMESTAMPTZ,
  last_gift_date TIMESTAMPTZ,
  gift_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_donors_tenant ON donors(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_donors_user ON donors(user_id);
CREATE INDEX IF NOT EXISTS idx_donors_email ON donors(church_tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_donors_stripe_customer ON donors(stripe_customer_id);

COMMENT ON TABLE donors IS 'Donor information - CHURCH TENANT ACCESS ONLY, NO SUPER ADMIN ACCESS';

-- =====================================================
-- 5. DONATIONS TABLE
-- =====================================================
-- Individual donation transactions
-- CRITICAL: Super admin CANNOT access this table

CREATE TABLE IF NOT EXISTS donations (
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
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  
  -- Donation details
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT,
  recurring_subscription_id TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  donor_note TEXT,
  internal_note TEXT,
  
  -- Fees and net amount
  stripe_fee INTEGER DEFAULT 0,
  net_amount INTEGER,
  
  -- Metadata
  donation_date TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_tenant ON donations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_fund ON donations(fund_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(church_tenant_id, donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_intent ON donations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_donations_recurring ON donations(church_tenant_id, is_recurring) WHERE is_recurring = true;

COMMENT ON TABLE donations IS 'Donation transactions - CHURCH TENANT ACCESS ONLY, NO SUPER ADMIN ACCESS';

-- =====================================================
-- 6. RECURRING DONATIONS TABLE
-- =====================================================
-- Manages recurring donation schedules
-- CRITICAL: Super admin CANNOT access this table

CREATE TABLE IF NOT EXISTS recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES giving_funds(id) ON DELETE SET NULL,
  
  -- Stripe subscription data
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Recurring details
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT NOT NULL,
  interval_count INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Schedule
  start_date TIMESTAMPTZ NOT NULL,
  next_payment_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Tracking
  total_donations INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  last_donation_date TIMESTAMPTZ,
  
  -- Cancellation
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_donations_tenant ON recurring_donations(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_donations_donor ON recurring_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_recurring_donations_status ON recurring_donations(church_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_recurring_donations_next_payment ON recurring_donations(next_payment_date) WHERE status = 'active';

COMMENT ON TABLE recurring_donations IS 'Recurring donation subscriptions - CHURCH TENANT ACCESS ONLY, NO SUPER ADMIN ACCESS';

-- =====================================================
-- 7. GIVING SETTINGS TABLE
-- =====================================================
-- Church-specific giving configuration

CREATE TABLE IF NOT EXISTS giving_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  
  -- Branding
  primary_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,
  header_image_url TEXT,
  thank_you_message TEXT DEFAULT 'Thank you for your generous gift!',
  
  -- Suggested amounts
  suggested_amounts INTEGER[] DEFAULT ARRAY[2500, 5000, 10000, 25000],
  allow_custom_amount BOOLEAN DEFAULT true,
  minimum_amount INTEGER DEFAULT 100,
  
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

CREATE INDEX IF NOT EXISTS idx_giving_settings_tenant ON giving_settings(church_tenant_id);
CREATE INDEX IF NOT EXISTS idx_giving_settings_slug ON giving_settings(public_page_slug) WHERE public_page_slug IS NOT NULL;

COMMENT ON TABLE giving_settings IS 'Giving configuration - church tenant access only';

-- =====================================================
-- TRIGGERS: Update Totals
-- =====================================================

CREATE OR REPLACE FUNCTION update_giving_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update fund total
  IF NEW.fund_id IS NOT NULL AND NEW.status = 'succeeded' THEN
    UPDATE giving_funds
    SET current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE fund_id = NEW.fund_id
        AND status = 'succeeded'
    ),
    updated_at = NOW()
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
    ),
    updated_at = NOW()
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
    last_gift_date = CASE 
      WHEN NEW.status = 'succeeded' THEN NEW.donation_date 
      ELSE last_gift_date 
    END,
    first_gift_date = COALESCE(first_gift_date, CASE 
      WHEN NEW.status = 'succeeded' THEN NEW.donation_date 
      ELSE NULL 
    END),
    updated_at = NOW()
  WHERE id = NEW.donor_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_giving_totals ON donations;
CREATE TRIGGER trigger_update_giving_totals
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_giving_totals();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- CRITICAL: These policies ensure:
-- 1. Churches can ONLY access their own data
-- 2. Super admins CANNOT access donor/donation data
-- 3. Complete multi-tenant isolation
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE stripe_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STRIPE CONNECTIONS POLICIES
-- Exception: Super admin CAN view for support (no sensitive data)
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own stripe connection" ON stripe_connections;
DROP POLICY IF EXISTS "Super admin can view stripe connections for support" ON stripe_connections;

CREATE POLICY "Church can manage own stripe connection"
ON stripe_connections FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Super admin can view stripe connections for support"
ON stripe_connections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- GIVING FUNDS POLICIES
-- Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own funds" ON giving_funds;

CREATE POLICY "Church can manage own funds"
ON giving_funds FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- GIVING CAMPAIGNS POLICIES
-- Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own campaigns" ON giving_campaigns;

CREATE POLICY "Church can manage own campaigns"
ON giving_campaigns FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- DONORS POLICIES
-- CRITICAL: Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own donors" ON donors;

CREATE POLICY "Church can manage own donors"
ON donors FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- DONATIONS POLICIES
-- CRITICAL: Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own donations" ON donations;

CREATE POLICY "Church can manage own donations"
ON donations FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- RECURRING DONATIONS POLICIES
-- CRITICAL: Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own recurring donations" ON recurring_donations;

CREATE POLICY "Church can manage own recurring donations"
ON recurring_donations FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- GIVING SETTINGS POLICIES
-- Church tenant access only, NO super admin access
-- =====================================================

DROP POLICY IF EXISTS "Church can manage own giving settings" ON giving_settings;

CREATE POLICY "Church can manage own giving settings"
ON giving_settings FOR ALL
USING (
  church_tenant_id = (
    SELECT church_tenant_id 
    FROM users 
    WHERE id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON stripe_connections TO authenticated;
GRANT ALL ON giving_funds TO authenticated;
GRANT ALL ON giving_campaigns TO authenticated;
GRANT ALL ON donors TO authenticated;
GRANT ALL ON donations TO authenticated;
GRANT ALL ON recurring_donations TO authenticated;
GRANT ALL ON giving_settings TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Giving System Schema Created Successfully';
  RAISE NOTICE '✅ All tables created with proper indexes';
  RAISE NOTICE '✅ RLS policies enforced - tenant isolation guaranteed';
  RAISE NOTICE '✅ Super admin CANNOT access donor/donation data';
  RAISE NOTICE '✅ Triggers configured for automatic total updates';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '   - stripe_connections (Stripe Connect accounts)';
  RAISE NOTICE '   - giving_funds (Designated funds)';
  RAISE NOTICE '   - giving_campaigns (Fundraising campaigns)';
  RAISE NOTICE '   - donors (Donor profiles) 🔒 PRIVATE';
  RAISE NOTICE '   - donations (Transaction records) 🔒 PRIVATE';
  RAISE NOTICE '   - recurring_donations (Subscriptions) 🔒 PRIVATE';
  RAISE NOTICE '   - giving_settings (Church configuration)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Privacy Guarantee: Churches own their donor data';
END $$;
