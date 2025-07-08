-- Verify that the equipment relationships are now working correctly

-- Check total counts
SELECT 'Total equipment records:' as info, COUNT(*) as count FROM equipment;
SELECT 'Total thickness measurement records:' as info, COUNT(*) as count FROM thickness_measurement;
SELECT 'Total risk assessment records:' as info, COUNT(*) as count FROM equipment_risk_assessment;

-- Check equipment types distribution
SELECT 'Equipment type distribution:' as info;
SELECT "設備種別ID", COUNT(*) as count 
FROM equipment 
GROUP BY "設備種別ID" 
ORDER BY "設備種別ID";

-- Check some sample new equipment records
SELECT 'Sample new equipment records:' as info;
SELECT "設備ID", "設備名", "設備種別ID"
FROM equipment 
WHERE "設備ID" LIKE 'TK%' OR "設備ID" LIKE 'HX%' OR "設備ID" LIKE 'PU%'
ORDER BY "設備ID"
LIMIT 10;

-- Verify no orphaned records
SELECT 'Orphaned thickness measurement records:' as info, COUNT(*) as count
FROM thickness_measurement tm
LEFT JOIN equipment e ON tm."設備ID" = e."設備ID"
WHERE e."設備ID" IS NULL;

SELECT 'Orphaned risk assessment records:' as info, COUNT(*) as count
FROM equipment_risk_assessment era
LEFT JOIN equipment e ON era."設備ID" = e."設備ID"
WHERE e."設備ID" IS NULL;

-- Test a sample join query
SELECT 'Sample joined data:' as info;
SELECT e."設備ID", e."設備名", e."設備種別ID", era."リスクシナリオ"
FROM equipment e
JOIN equipment_risk_assessment era ON e."設備ID" = era."設備ID"
WHERE e."設備ID" LIKE 'TK%'
LIMIT 5;