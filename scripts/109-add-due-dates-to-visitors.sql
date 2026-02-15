-- Add due_date column to visitors table for Phase 1: Due Dates feature

ALTER TABLE visitors ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add index for efficient querying of due dates
CREATE INDEX IF NOT EXISTS idx_visitors_due_date ON visitors(due_date);

-- Add index for querying overdue visitors
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_due_date ON visitors(church_tenant_id, due_date);

SELECT 'Due date column and indexes added successfully!' as status;
