-- 設備種別マスタの「静機器」への更新
UPDATE equipment_type_master 
SET "設備種別名" = '静機器', 
    "説明" = '静的な機械設備'
WHERE "設備種別ID" = 1;