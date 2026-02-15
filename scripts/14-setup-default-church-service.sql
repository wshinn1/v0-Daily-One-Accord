-- Add is_default_service column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_default_service BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'custom';

-- Create index for default service events
CREATE INDEX IF NOT EXISTS idx_events_is_default_service ON events(church_tenant_id, is_default_service);

-- Function to ensure each church has a default church service event
CREATE OR REPLACE FUNCTION ensure_default_church_service()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new church tenant is created, create a default church service event
  INSERT INTO events (
    church_tenant_id,
    title,
    description,
    start_time,
    end_time,
    location,
    is_default_service,
    event_type,
    is_public
  ) VALUES (
    NEW.id,
    'Sunday Service',
    'Weekly church service',
    NOW() + INTERVAL '1 week' - EXTRACT(DOW FROM NOW()) * INTERVAL '1 day' + INTERVAL '10 hours',
    NOW() + INTERVAL '1 week' - EXTRACT(DOW FROM NOW()) * INTERVAL '1 day' + INTERVAL '12 hours',
    'Main Sanctuary',
    TRUE,
    'church_service',
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create default church service for new tenants
DROP TRIGGER IF EXISTS trigger_ensure_default_church_service ON church_tenants;
CREATE TRIGGER trigger_ensure_default_church_service
  AFTER INSERT ON church_tenants
  FOR EACH ROW
  EXECUTE FUNCTION ensure_default_church_service();

-- Prevent deletion of default church service events
CREATE OR REPLACE FUNCTION prevent_default_service_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_default_service = TRUE THEN
    RAISE EXCEPTION 'Cannot delete the default church service event';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_default_service_deletion ON events;
CREATE TRIGGER trigger_prevent_default_service_deletion
  BEFORE DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_default_service_deletion();

-- Create default church service for existing tenants that don't have one
INSERT INTO events (
  church_tenant_id,
  title,
  description,
  start_time,
  end_time,
  location,
  is_default_service,
  event_type,
  is_public
)
SELECT 
  ct.id,
  'Sunday Service',
  'Weekly church service',
  NOW() + INTERVAL '1 week' - EXTRACT(DOW FROM NOW()) * INTERVAL '1 day' + INTERVAL '10 hours',
  NOW() + INTERVAL '1 week' - EXTRACT(DOW FROM NOW()) * INTERVAL '1 day' + INTERVAL '12 hours',
  'Main Sanctuary',
  TRUE,
  'church_service',
  TRUE
FROM church_tenants ct
WHERE NOT EXISTS (
  SELECT 1 FROM events e 
  WHERE e.church_tenant_id = ct.id 
  AND e.is_default_service = TRUE
);
