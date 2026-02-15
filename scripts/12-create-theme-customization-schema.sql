-- Add theme customization columns to church_tenants table
ALTER TABLE church_tenants
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8b5cf6',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#1f2937',
ADD COLUMN IF NOT EXISTS heading_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS body_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_size_base TEXT DEFAULT '16px',
ADD COLUMN IF NOT EXISTS font_size_heading TEXT DEFAULT '32px';

-- Add comment to document the theme columns
COMMENT ON COLUMN church_tenants.logo_url IS 'URL to the church logo stored in Vercel Blob';
COMMENT ON COLUMN church_tenants.primary_color IS 'Primary brand color (hex format)';
COMMENT ON COLUMN church_tenants.secondary_color IS 'Secondary brand color (hex format)';
COMMENT ON COLUMN church_tenants.accent_color IS 'Accent color for highlights (hex format)';
COMMENT ON COLUMN church_tenants.background_color IS 'Main background color (hex format)';
COMMENT ON COLUMN church_tenants.text_color IS 'Primary text color (hex format)';
COMMENT ON COLUMN church_tenants.heading_font IS 'Font family for headings';
COMMENT ON COLUMN church_tenants.body_font IS 'Font family for body text';
COMMENT ON COLUMN church_tenants.font_size_base IS 'Base font size (px, rem, or em)';
COMMENT ON COLUMN church_tenants.font_size_heading IS 'Heading font size (px, rem, or em)';
