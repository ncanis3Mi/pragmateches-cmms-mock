-- Fix 精機器 → 静機器 typo in database
-- Update equipment_type_master table if it contains the old typo

UPDATE equipment_type_master 
SET "設備種別名" = '静機器', 
    "説明" = '静的な機械設備'
WHERE "設備種別名" = '精機器';

-- Verify the update
SELECT "設備種別ID", "設備種別名", "説明" 
FROM equipment_type_master 
WHERE "設備種別ID" = 1;