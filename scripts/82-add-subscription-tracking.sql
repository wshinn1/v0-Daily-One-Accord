-- Add subscription tracking columns to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mrr DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_church_tenants_stripe_customer ON church_tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_church_tenants_subscription_status ON church_tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_church_tenants_subscription_plan ON church_tenants(subscription_plan);

-- Add comments
COMMENT ON COLUMN church_tenants.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN church_tenants.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN church_tenants.subscription_plan IS 'Current subscription plan (starter, growth, enterprise)';
COMMENT ON COLUMN church_tenants.subscription_status IS 'Subscription status (active, past_due, canceled, trialing, inactive)';
COMMENT ON COLUMN church_tenants.mrr IS 'Monthly Recurring Revenue for this tenant';
