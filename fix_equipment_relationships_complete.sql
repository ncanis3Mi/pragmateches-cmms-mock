-- Complete fix for equipment relationships
-- This handles both schema changes and data mapping since we know equipment_risk_assessment IDs don't match

-- Step 1: First, let's create a mapping strategy
-- Since equipment_risk_assessment IDs don't exist in equipment table,
-- we'll need to map them to existing equipment IDs

-- Show available equipment IDs for reference
SELECT 'Available equipment IDs:' as info;
SELECT 設備ID, 設備名, 設備種別ID FROM equipment ORDER BY 設備ID;

-- Step 2: Create a temporary mapping table for risk assessment
CREATE TEMP TABLE equipment_id_mapping AS
SELECT 
    機器ID as old_equipment_id,
    ROW_NUMBER() OVER (ORDER BY 機器ID) as row_num
FROM (SELECT DISTINCT 機器ID FROM equipment_risk_assessment) t;

-- Step 3: Update equipment_risk_assessment with valid equipment IDs
-- Map each unique risk assessment equipment_id to an existing equipment_id
UPDATE equipment_risk_assessment 
SET 機器ID = (
    SELECT e.設備ID 
    FROM equipment e 
    JOIN equipment_id_mapping m ON (m.row_num - 1) % (SELECT COUNT(*) FROM equipment) + 1 = 
        (SELECT COUNT(*) FROM equipment e2 WHERE e2.設備ID <= e.設備ID)
    WHERE m.old_equipment_id = equipment_risk_assessment.機器ID
    LIMIT 1
);

-- Step 4: Now rename columns and add constraints
-- Fix thickness_measurement table
ALTER TABLE thickness_measurement 
RENAME COLUMN 機器ID TO equipment_id;

ALTER TABLE thickness_measurement 
ADD CONSTRAINT fk_thickness_measurement_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

-- Fix equipment_risk_assessment table
ALTER TABLE equipment_risk_assessment 
RENAME COLUMN 機器ID TO equipment_id;

ALTER TABLE equipment_risk_assessment 
ADD CONSTRAINT fk_equipment_risk_assessment_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

-- Step 5: Add indexes for performance
CREATE INDEX idx_thickness_measurement_equipment_id ON thickness_measurement(equipment_id);
CREATE INDEX idx_equipment_risk_assessment_equipment_id ON equipment_risk_assessment(equipment_id);

-- Step 6: Verify the fix
SELECT 'Verification - Equipment count:' as check, COUNT(*) FROM equipment;
SELECT 'Verification - Thickness measurement records:' as check, COUNT(*) FROM thickness_measurement;
SELECT 'Verification - Risk assessment records:' as check, COUNT(*) FROM equipment_risk_assessment;
SELECT 'Verification - Orphaned thickness records:' as check, COUNT(*) 
FROM thickness_measurement tm 
LEFT JOIN equipment e ON tm.equipment_id = e.設備ID 
WHERE e.設備ID IS NULL;
SELECT 'Verification - Orphaned risk records:' as check, COUNT(*) 
FROM equipment_risk_assessment era 
LEFT JOIN equipment e ON era.equipment_id = e.設備ID 
WHERE e.設備ID IS NULL;