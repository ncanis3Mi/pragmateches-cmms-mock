-- ====================================
-- 機器ID を 設備ID に統一する
-- ====================================

-- thickness_measurement テーブルの機器IDを設備IDに変更
ALTER TABLE thickness_measurement 
RENAME COLUMN "機器ID" TO "設備ID";

-- equipment_risk_assessment テーブルの機器IDを設備IDに変更  
ALTER TABLE equipment_risk_assessment 
RENAME COLUMN "機器ID" TO "設備ID";

-- インデックスを再作成
DROP INDEX IF EXISTS idx_thickness_equipment;
DROP INDEX IF EXISTS idx_risk_equipment;

CREATE INDEX idx_thickness_equipment ON thickness_measurement("設備ID");
CREATE INDEX idx_risk_equipment ON equipment_risk_assessment("設備ID");