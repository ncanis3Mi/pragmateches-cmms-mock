-- 肉厚測定データテーブル
CREATE TABLE IF NOT EXISTS thickness_measurement (
    id SERIAL PRIMARY KEY,
    "機器ID" VARCHAR(50) NOT NULL,
    "測定点ID" VARCHAR(50) NOT NULL,
    "検査日" DATE NOT NULL,
    "設計肉厚(mm)" DECIMAL(6,2),
    "最小許容肉厚(mm)" DECIMAL(6,2),
    "測定値(mm)" DECIMAL(6,2),
    "判定結果" VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_thickness_equipment ON thickness_measurement("機器ID");
CREATE INDEX idx_thickness_date ON thickness_measurement("検査日");

-- 設備別リスク評価テーブル
CREATE TABLE IF NOT EXISTS equipment_risk_assessment (
    id SERIAL PRIMARY KEY,
    "機器ID" VARCHAR(50) NOT NULL,
    "評価年" DATE NOT NULL,
    "リスクシナリオ" VARCHAR(100),
    "評価タイミング" VARCHAR(50),
    "緩和策" VARCHAR(200),
    "信頼性ランク（5段階）" VARCHAR(20),
    "影響度ランク（5段階）" VARCHAR(20),
    "リスクスコア（再計算）" INTEGER,
    "リスクレベル（5段階）" VARCHAR(20),
    "リスク許容性" VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_risk_equipment ON equipment_risk_assessment("機器ID");
CREATE INDEX idx_risk_year ON equipment_risk_assessment("評価年");

-- RLS (Row Level Security) 設定
ALTER TABLE thickness_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_risk_assessment ENABLE ROW LEVEL SECURITY;

-- パブリックアクセスポリシー作成
CREATE POLICY "thickness_measurement_select_all" ON thickness_measurement FOR SELECT USING (true);
CREATE POLICY "thickness_measurement_insert_all" ON thickness_measurement FOR INSERT WITH CHECK (true);
CREATE POLICY "thickness_measurement_update_all" ON thickness_measurement FOR UPDATE USING (true);
CREATE POLICY "thickness_measurement_delete_all" ON thickness_measurement FOR DELETE USING (true);

CREATE POLICY "equipment_risk_assessment_select_all" ON equipment_risk_assessment FOR SELECT USING (true);
CREATE POLICY "equipment_risk_assessment_insert_all" ON equipment_risk_assessment FOR INSERT WITH CHECK (true);
CREATE POLICY "equipment_risk_assessment_update_all" ON equipment_risk_assessment FOR UPDATE USING (true);
CREATE POLICY "equipment_risk_assessment_delete_all" ON equipment_risk_assessment FOR DELETE USING (true);