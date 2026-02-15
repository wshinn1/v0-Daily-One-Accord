-- Create visitor_dependencies table for linking visitors together
CREATE TABLE IF NOT EXISTS visitor_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_tenant_id UUID NOT NULL REFERENCES church_tenants(id) ON DELETE CASCADE,
  source_visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  target_visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('related_to', 'blocked_by', 'duplicate_of', 'family_member')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(source_visitor_id, target_visitor_id, dependency_type)
);

CREATE INDEX idx_visitor_dependencies_source ON visitor_dependencies(source_visitor_id);
CREATE INDEX idx_visitor_dependencies_target ON visitor_dependencies(target_visitor_id);
CREATE INDEX idx_visitor_dependencies_tenant ON visitor_dependencies(church_tenant_id);
