-- Add subscription add-ons tracking to church_tenants
-- This tracks which add-ons (like social media scheduling) each church has purchased

ALTER TABLE church_tenants 
ADD COLUMN IF NOT EXISTS subscription_addons JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN church_tenants.subscription_addons IS 'Array of add-on subscriptions (e.g., ["social_media"])';

-- Example structure:
-- subscription_addons: ["social_media", "advanced_reporting"]
-- Each add-on name corresponds to ADDON_DETAILS in lib/stripe/config.ts
