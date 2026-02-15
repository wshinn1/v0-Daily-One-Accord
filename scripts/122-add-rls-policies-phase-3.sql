-- Row Level Security Policies for Phase 3 Tables
-- Ensures tenant isolation for saved_filters, visitor_dependencies, and board_templates

-- ============================================================================
-- ENABLE RLS ON PHASE 3 TABLES
-- ============================================================================

ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SAVED FILTERS POLICIES
-- Users can manage their own saved filters within their church
-- ============================================================================

DROP POLICY IF EXISTS "Users can view saved filters in their church" ON saved_filters;
CREATE POLICY "Users can view saved filters in their church"
  ON saved_filters FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create their own saved filters" ON saved_filters;
CREATE POLICY "Users can create their own saved filters"
  ON saved_filters FOR INSERT
  WITH CHECK (
    church_tenant_id = get_user_church_tenant_id() 
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own saved filters" ON saved_filters;
CREATE POLICY "Users can update their own saved filters"
  ON saved_filters FOR UPDATE
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own saved filters" ON saved_filters;
CREATE POLICY "Users can delete their own saved filters"
  ON saved_filters FOR DELETE
  USING (
    church_tenant_id = get_user_church_tenant_id() 
    AND user_id = auth.uid()
  );

-- ============================================================================
-- VISITOR DEPENDENCIES POLICIES
-- Users can manage visitor dependencies within their church
-- ============================================================================

DROP POLICY IF EXISTS "Users can view visitor dependencies in their church" ON visitor_dependencies;
CREATE POLICY "Users can view visitor dependencies in their church"
  ON visitor_dependencies FOR SELECT
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can create visitor dependencies in their church" ON visitor_dependencies;
CREATE POLICY "Users can create visitor dependencies in their church"
  ON visitor_dependencies FOR INSERT
  WITH CHECK (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can update visitor dependencies in their church" ON visitor_dependencies;
CREATE POLICY "Users can update visitor dependencies in their church"
  ON visitor_dependencies FOR UPDATE
  USING (church_tenant_id = get_user_church_tenant_id());

DROP POLICY IF EXISTS "Users can delete visitor dependencies in their church" ON visitor_dependencies;
CREATE POLICY "Users can delete visitor dependencies in their church"
  ON visitor_dependencies FOR DELETE
  USING (church_tenant_id = get_user_church_tenant_id());

-- ============================================================================
-- BOARD TEMPLATES POLICIES
-- Users can view public templates and manage their own templates
-- ============================================================================

DROP POLICY IF EXISTS "Users can view public and own templates" ON board_templates;
CREATE POLICY "Users can view public and own templates"
  ON board_templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create their own templates" ON board_templates;
CREATE POLICY "Users can create their own templates"
  ON board_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own templates" ON board_templates;
CREATE POLICY "Users can update their own templates"
  ON board_templates FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own templates" ON board_templates;
CREATE POLICY "Users can delete their own templates"
  ON board_templates FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- saved_filters: Users can only manage their own filters within their church
-- visitor_dependencies: Standard tenant isolation based on church_tenant_id
-- board_templates: Public templates are visible to all, private templates only to creator
