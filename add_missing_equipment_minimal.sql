-- Minimal version - insert only required columns first
-- Step 1: Insert missing equipment records with minimal columns
INSERT INTO equipment (設備ID, 設備名, 設備種別ID)
SELECT DISTINCT 
    era.機器ID as 設備ID,
    era.機器ID as 設備名,
    CASE 
        WHEN era.機器ID LIKE 'TK%' OR era.機器ID LIKE 'HX%' THEN 1
        WHEN era.機器ID LIKE 'PU%' THEN 2
        ELSE 1
    END as 設備種別ID
FROM equipment_risk_assessment era
WHERE era.機器ID NOT IN (SELECT 設備ID FROM equipment);

-- Step 2: Insert missing equipment from thickness_measurement
INSERT INTO equipment (設備ID, 設備名, 設備種別ID)
SELECT DISTINCT 
    tm.機器ID as 設備ID,
    tm.機器ID as 設備名,
    CASE 
        WHEN tm.機器ID LIKE 'TK%' OR tm.機器ID LIKE 'HX%' THEN 1
        WHEN tm.機器ID LIKE 'PU%' THEN 2
        ELSE 1
    END as 設備種別ID
FROM thickness_measurement tm
WHERE tm.機器ID NOT IN (SELECT 設備ID FROM equipment);

-- Step 3: Rename columns
ALTER TABLE thickness_measurement 
RENAME COLUMN 機器ID TO 設備ID;

ALTER TABLE equipment_risk_assessment 
RENAME COLUMN 機器ID TO 設備ID;

-- Step 4: Add foreign key constraints
ALTER TABLE thickness_measurement 
ADD CONSTRAINT fk_thickness_measurement_equipment 
FOREIGN KEY (設備ID) REFERENCES equipment(設備ID);

ALTER TABLE equipment_risk_assessment 
ADD CONSTRAINT fk_equipment_risk_assessment_equipment 
FOREIGN KEY (設備ID) REFERENCES equipment(設備ID);

-- Verification
SELECT 'Total equipment:' as info, COUNT(*) FROM equipment;
SELECT 'Thickness measurement records:' as info, COUNT(*) FROM thickness_measurement;
SELECT 'Risk assessment records:' as info, COUNT(*) FROM equipment_risk_assessment;