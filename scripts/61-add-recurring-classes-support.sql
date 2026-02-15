-- Add support for recurring classes
-- Add columns for recurring class functionality

-- Add recurring columns to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurrence_days TEXT[]; -- Array of days: ['Monday', 'Tuesday', etc.]

-- Create index for recurring classes
CREATE INDEX IF NOT EXISTS idx_classes_is_recurring ON classes(is_recurring);

SELECT 'Recurring classes support added successfully' AS result;
