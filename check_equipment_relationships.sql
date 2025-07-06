-- Check equipment relationships and data integrity
-- Run these queries to understand the current state before applying fixes

-- 1. Check all equipment IDs in the main equipment table
SELECT '=== Equipment table ===' as section;
SELECT 設備ID, 設備名, 設備種別ID 
FROM equipment 
ORDER BY 設備ID 
LIMIT 10;

SELECT 'Total equipment count: ' || COUNT(*) as info FROM equipment;

-- 2. Check device IDs in thickness_measurement table
SELECT '=== Thickness Measurement table ===' as section;
SELECT DISTINCT 機器ID, COUNT(*) as record_count
FROM thickness_measurement 
GROUP BY 機器ID 
ORDER BY 機器ID 
LIMIT 10;

SELECT 'Total thickness measurement records: ' || COUNT(*) as info FROM thickness_measurement;

-- 3. Check device IDs in equipment_risk_assessment table
SELECT '=== Equipment Risk Assessment table ===' as section;
SELECT DISTINCT 機器ID, COUNT(*) as record_count
FROM equipment_risk_assessment 
GROUP BY 機器ID 
ORDER BY 機器ID 
LIMIT 10;

SELECT 'Total risk assessment records: ' || COUNT(*) as info FROM equipment_risk_assessment;

-- 4. Check for mismatched IDs
SELECT '=== ID Mismatch Analysis ===' as section;

-- Thickness measurement IDs not in equipment table
SELECT 'Thickness measurement IDs not in equipment:' as analysis;
SELECT DISTINCT tm.機器ID
FROM thickness_measurement tm
LEFT JOIN equipment e ON tm.機器ID = e.設備ID
WHERE e.設備ID IS NULL;

-- Risk assessment IDs not in equipment table  
SELECT 'Risk assessment IDs not in equipment:' as analysis;
SELECT DISTINCT era.機器ID
FROM equipment_risk_assessment era
LEFT JOIN equipment e ON era.機器ID = e.設備ID
WHERE e.設備ID IS NULL;

-- 5. Sample data from each table for reference
SELECT '=== Sample Data ===' as section;
SELECT 'Equipment sample:' as table_name, 設備ID, 設備名 FROM equipment LIMIT 3;
SELECT 'Thickness sample:' as table_name, 機器ID, 測定点ID FROM thickness_measurement LIMIT 3;
SELECT 'Risk assessment sample:' as table_name, 機器ID, リスクシナリオ FROM equipment_risk_assessment LIMIT 3;