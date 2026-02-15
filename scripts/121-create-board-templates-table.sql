-- Create board_templates table for reusable board configurations
CREATE TABLE IF NOT EXISTS board_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Added IF NOT EXISTS to prevent errors on re-run
CREATE INDEX IF NOT EXISTS idx_board_templates_public ON board_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_board_templates_tenant ON board_templates(church_tenant_id);
