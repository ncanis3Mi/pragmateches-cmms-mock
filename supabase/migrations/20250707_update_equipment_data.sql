-- Update equipment_id values to match actual equipment records
-- This script checks for valid equipment IDs and updates the data accordingly

-- First, let's see what equipment IDs actually exist
-- (Run this as a check first)
-- SELECT DISTINCT 設備ID FROM equipment ORDER BY 設備ID;

-- Check current equipment_id values in thickness_measurement
-- SELECT DISTINCT equipment_id FROM thickness_measurement ORDER BY equipment_id;

-- Check current equipment_id values in equipment_risk_assessment  
-- SELECT DISTINCT equipment_id FROM equipment_risk_assessment ORDER BY equipment_id;

-- If the equipment_id values don't match real equipment IDs, 
-- you may need to update them. For example:

-- Update thickness_measurement table if needed
-- UPDATE thickness_measurement 
-- SET equipment_id = 'CORRECT_EQUIPMENT_ID' 
-- WHERE equipment_id = 'WRONG_EQUIPMENT_ID';

-- Update equipment_risk_assessment table if needed
-- UPDATE equipment_risk_assessment 
-- SET equipment_id = 'CORRECT_EQUIPMENT_ID' 
-- WHERE equipment_id = 'WRONG_EQUIPMENT_ID';

-- Note: Uncomment and modify the UPDATE statements above based on your actual data
-- You should first verify what equipment IDs exist in your equipment table
-- and then map the thickness_measurement and equipment_risk_assessment records accordingly