-- Check what columns actually exist in the equipment table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'equipment' 
ORDER BY ordinal_position;

-- Also check sample data
SELECT * FROM equipment LIMIT 2;