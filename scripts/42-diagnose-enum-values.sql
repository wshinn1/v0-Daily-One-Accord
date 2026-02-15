-- Check what values are in the user_role enum
SELECT 
  'user_role' as enum_name,
  enumlabel as enum_value,
  enumsortorder as sort_order
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;

-- Check what values are in the visitor_status enum
SELECT 
  'visitor_status' as enum_name,
  enumlabel as enum_value,
  enumsortorder as sort_order
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'visitor_status'
ORDER BY enumsortorder;

-- Check if visitors table exists
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'visitors'
ORDER BY ordinal_position;
