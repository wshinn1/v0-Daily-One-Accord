-- Insert a demo church tenant for testing
INSERT INTO church_tenants (id, name, slug)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Church', 'demo-church');

-- Note: Super admin user will be created through the sign-up flow
-- The email weshinn@gmail.com will be set as super admin after account creation
