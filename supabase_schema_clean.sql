-- Create CMMS Schema Migration
-- Based on the data model from docs/data_model.md

-- Master Tables
CREATE TABLE equipment_type_master (
    "設備種別ID" INTEGER PRIMARY KEY,
    "設備種別名" VARCHAR(50) NOT NULL,
    "説明" TEXT
);

CREATE TABLE work_type_master (
    "作業種別ID" INTEGER PRIMARY KEY,
    "作業種別名" VARCHAR(50) NOT NULL,
    "説明" TEXT,
    "標準作業時間" INTEGER -- in hours
);

CREATE TABLE staff_master (
    "担当者ID" VARCHAR(10) PRIMARY KEY,
    "氏名" VARCHAR(50) NOT NULL,
    "部署" VARCHAR(50),
    "役職" VARCHAR(30),
    "専門分野" VARCHAR(30),
    "連絡先" VARCHAR(100)
);

CREATE TABLE contractor_master (
    "業者ID" VARCHAR(10) PRIMARY KEY,
    "業者名" VARCHAR(100) NOT NULL,
    "業者種別" VARCHAR(50),
    "専門分野" VARCHAR(50),
    "連絡先" VARCHAR(100),
    "担当者名" VARCHAR(50),
    "契約開始日" DATE,
    "契約終了日" DATE
);

CREATE TABLE inspection_cycle_master (
    "周期ID" INTEGER PRIMARY KEY,
    "周期名" VARCHAR(20) NOT NULL,
    "周期日数" INTEGER NOT NULL,
    "説明" TEXT
);

-- Main Tables
CREATE TABLE equipment (
    "設備ID" VARCHAR(10) PRIMARY KEY,
    "設備名" VARCHAR(100) NOT NULL,
    "設備種別ID" INTEGER REFERENCES equipment_type_master("設備種別ID"),
    "設備タグ" VARCHAR(20) UNIQUE NOT NULL,
    "設置場所" VARCHAR(100),
    "製造者" VARCHAR(50),
    "型式" VARCHAR(50),
    "設置年月日" DATE,
    "稼働状態" VARCHAR(20),
    "重要度" VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE work_order (
    "作業指示ID" VARCHAR(10) PRIMARY KEY,
    "設備ID" VARCHAR(10) REFERENCES equipment("設備ID"),
    "作業種別ID" INTEGER REFERENCES work_type_master("作業種別ID"),
    "作業内容" TEXT NOT NULL,
    "優先度" VARCHAR(10),
    "計画開始日時" TIMESTAMP,
    "計画終了日時" TIMESTAMP,
    "実際開始日時" TIMESTAMP,
    "実際終了日時" TIMESTAMP,
    "作業者ID" VARCHAR(10) REFERENCES staff_master("担当者ID"),
    "状態" VARCHAR(20),
    "備考" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE maintenance_history (
    "履歴ID" VARCHAR(10) PRIMARY KEY,
    "設備ID" VARCHAR(10) REFERENCES equipment("設備ID"),
    "作業指示ID" VARCHAR(10) REFERENCES work_order("作業指示ID"),
    "実施日" DATE NOT NULL,
    "作業者ID" VARCHAR(10) REFERENCES staff_master("担当者ID"),
    "業者ID" VARCHAR(10) REFERENCES contractor_master("業者ID"),
    "作業内容" TEXT,
    "作業結果" TEXT,
    "使用部品" TEXT,
    "作業時間" DECIMAL(4,2), -- in hours
    "コスト" INTEGER, -- in yen
    "次回推奨日" DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inspection_plan (
    "計画ID" VARCHAR(10) PRIMARY KEY,
    "設備ID" VARCHAR(10) REFERENCES equipment("設備ID"),
    "周期ID" INTEGER REFERENCES inspection_cycle_master("周期ID"),
    "点検項目" TEXT NOT NULL,
    "最終点検日" DATE,
    "次回点検日" DATE,
    "担当者ID" VARCHAR(10) REFERENCES staff_master("担当者ID"),
    "状態" VARCHAR(20),
    "備考" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE anomaly_report (
    "報告ID" VARCHAR(10) PRIMARY KEY,
    "設備ID" VARCHAR(10) REFERENCES equipment("設備ID"),
    "発生日時" TIMESTAMP NOT NULL,
    "発見者ID" VARCHAR(10) REFERENCES staff_master("担当者ID"),
    "異常種別" VARCHAR(30) NOT NULL,
    "重大度" VARCHAR(10) NOT NULL,
    "症状" TEXT,
    "原因" TEXT,
    "対処方法" TEXT,
    "状態" VARCHAR(20),
    "報告日時" TIMESTAMP,
    "解決日時" TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_type ON equipment("設備種別ID");
CREATE INDEX idx_equipment_location ON equipment("設置場所");
CREATE INDEX idx_work_order_equipment ON work_order("設備ID");
CREATE INDEX idx_work_order_status ON work_order("状態");
CREATE INDEX idx_maintenance_equipment ON maintenance_history("設備ID");
CREATE INDEX idx_maintenance_date ON maintenance_history("実施日");
CREATE INDEX idx_inspection_equipment ON inspection_plan("設備ID");
CREATE INDEX idx_inspection_next_date ON inspection_plan("次回点検日");
CREATE INDEX idx_anomaly_equipment ON anomaly_report("設備ID");
CREATE INDEX idx_anomaly_status ON anomaly_report("状態");
CREATE INDEX idx_anomaly_severity ON anomaly_report("重大度");

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE equipment_type_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_type_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_cycle_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_report ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow all access" ON equipment_type_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON work_type_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON staff_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON contractor_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON inspection_cycle_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON equipment FOR ALL USING (true);
CREATE POLICY "Allow all access" ON work_order FOR ALL USING (true);
CREATE POLICY "Allow all access" ON maintenance_history FOR ALL USING (true);
CREATE POLICY "Allow all access" ON inspection_plan FOR ALL USING (true);
CREATE POLICY "Allow all access" ON anomaly_report FOR ALL USING (true);