-- Add billing exemption column to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS billing_exempt BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS billing_exempt_reason TEXT,
ADD COLUMN IF NOT EXISTS billing_exempt_set_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS billing_exempt_set_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_church_tenants_billing_exempt ON church_tenants(billing_exempt);

-- Add comments
COMMENT ON COLUMN church_tenants.billing_exempt IS 'Whether this church is exempt from billing (sponsored/free account)';
COMMENT ON COLUMN church_tenants.billing_exempt_reason IS 'Reason for billing exemption';
COMMENT ON COLUMN church_tenants.billing_exempt_set_by IS 'Super admin who set the billing exemption';
COMMENT ON COLUMN church_tenants.billing_exempt_set_at IS 'When the billing exemption was set';
