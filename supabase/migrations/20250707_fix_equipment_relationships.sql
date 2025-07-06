-- Fix equipment relationships: rename device_id to equipment_id and add proper foreign key constraints

-- First, rename the column in thickness_measurement table
ALTER TABLE thickness_measurement 
RENAME COLUMN 機器ID TO equipment_id;

-- Add foreign key constraint to equipment table
ALTER TABLE thickness_measurement 
ADD CONSTRAINT fk_thickness_measurement_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

-- Second, rename the column in equipment_risk_assessment table  
ALTER TABLE equipment_risk_assessment 
RENAME COLUMN 機器ID TO equipment_id;

-- Add foreign key constraint to equipment table
ALTER TABLE equipment_risk_assessment 
ADD CONSTRAINT fk_equipment_risk_assessment_equipment 
FOREIGN KEY (equipment_id) REFERENCES equipment(設備ID);

-- Add indexes for better performance
CREATE INDEX idx_thickness_measurement_equipment_id ON thickness_measurement(equipment_id);
CREATE INDEX idx_equipment_risk_assessment_equipment_id ON equipment_risk_assessment(equipment_id);