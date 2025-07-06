-- Simple approach: Map equipment_risk_assessment IDs to existing equipment IDs
-- This assumes you want to distribute risk assessments across your existing equipment

-- Step 1: Update equipment_risk_assessment to use valid equipment IDs
-- This will cycle through available equipment IDs for the risk assessment data
WITH equipment_list AS (
    SELECT 設備ID, ROW_NUMBER() OVER (ORDER BY 設備ID) as eq_row
    FROM equipment
),
risk_data AS (
    SELECT 
        id,
        機器ID,
        ROW_NUMBER() OVER (ORDER BY id) as risk_row
    FROM equipment_risk_assessment
)
UPDATE equipment_risk_assessment 
SET 機器ID = (
    SELECT e.設備ID 
    FROM equipment_list e 
    WHERE e.eq_row = ((risk_data.risk_row - 1) % (SELECT COUNT(*) FROM equipment)) + 1
)
FROM risk_data
WHERE equipment_risk_assessment.id = risk_data.id;

-- Step 2: Rename columns to equipment_id
ALTER TABLE thickness_measurement 
RENAME COLUMN 機器ID TO equipment_id;

ALTER TABLE equipment_risk_assessment 
RENAME COLUMN 機器ID TO equipment_id;

-- Step 3: Add foreign key constraints
ALTER TABLE thickness_measurement 
ADD CONSTRAINT fk_thickness_measurement_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

ALTER TABLE equipment_risk_assessment 
ADD CONSTRAINT fk_equipment_risk_assessment_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

-- Step 4: Add indexes
CREATE INDEX idx_thickness_measurement_equipment_id ON thickness_measurement(equipment_id);
CREATE INDEX idx_equipment_risk_assessment_equipment_id ON equipment_risk_assessment(equipment_id);