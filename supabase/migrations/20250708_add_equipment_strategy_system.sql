-- ============================================
-- Equipment Strategy and Automatic Task Generation System
-- ============================================

-- 1. Equipment Strategy Master Table
CREATE TABLE equipment_strategy (
    strategy_id VARCHAR(10) PRIMARY KEY,
    equipment_id VARCHAR(10) NOT NULL REFERENCES equipment("設備ID"),
    strategy_name VARCHAR(100) NOT NULL,
    strategy_type VARCHAR(30) NOT NULL, -- 'PREVENTIVE', 'PREDICTIVE', 'CONDITION_BASED'
    frequency_type VARCHAR(20) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'
    frequency_value INTEGER NOT NULL, -- Number of days/weeks/months
    estimated_duration_hours DECIMAL(4,2) NOT NULL,
    required_skill_level VARCHAR(20), -- 'BASIC', 'INTERMEDIATE', 'EXPERT'
    required_area VARCHAR(50), -- Work area/location requirement
    task_description TEXT NOT NULL,
    safety_requirements TEXT,
    tools_required TEXT,
    parts_required TEXT,
    priority VARCHAR(10) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Task Generation Tracking Table
CREATE TABLE task_generation_log (
    log_id SERIAL PRIMARY KEY,
    strategy_id VARCHAR(10) NOT NULL REFERENCES equipment_strategy(strategy_id),
    generated_date DATE NOT NULL,
    next_generation_date DATE NOT NULL,
    work_order_id VARCHAR(10) REFERENCES work_order("作業指示ID"),
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'GENERATED', 'ASSIGNED', 'FAILED'
    assigned_staff_id VARCHAR(10) REFERENCES staff_master("担当者ID"),
    generation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staff Skills and Areas Table (for intelligent assignment)
CREATE TABLE staff_skills (
    skill_id SERIAL PRIMARY KEY,
    staff_id VARCHAR(10) NOT NULL REFERENCES staff_master("担当者ID"),
    skill_type VARCHAR(30) NOT NULL, -- 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION', etc.
    skill_level VARCHAR(20) NOT NULL, -- 'BASIC', 'INTERMEDIATE', 'EXPERT'
    area VARCHAR(50), -- Work area/location
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Equipment Strategy Schedule View (for easy monitoring)
CREATE VIEW equipment_strategy_schedule AS
SELECT 
    es.strategy_id,
    es.equipment_id,
    e."設備名" as equipment_name,
    es.strategy_name,
    es.strategy_type,
    es.frequency_type,
    es.frequency_value,
    es.task_description,
    es.priority,
    COALESCE(
        MAX(tgl.next_generation_date),
        CURRENT_DATE
    ) as next_due_date,
    CASE 
        WHEN COALESCE(MAX(tgl.next_generation_date), CURRENT_DATE) <= CURRENT_DATE 
        THEN 'DUE'
        WHEN COALESCE(MAX(tgl.next_generation_date), CURRENT_DATE) <= CURRENT_DATE + INTERVAL '7 days'
        THEN 'UPCOMING'
        ELSE 'SCHEDULED'
    END as status,
    COUNT(tgl.log_id) as generation_count
FROM equipment_strategy es
LEFT JOIN equipment e ON es.equipment_id = e."設備ID"
LEFT JOIN task_generation_log tgl ON es.strategy_id = tgl.strategy_id
WHERE es.is_active = true
GROUP BY es.strategy_id, es.equipment_id, e."設備名", es.strategy_name, 
         es.strategy_type, es.frequency_type, es.frequency_value,
         es.task_description, es.priority;

-- 5. Indexes for performance
CREATE INDEX idx_equipment_strategy_equipment ON equipment_strategy(equipment_id);
CREATE INDEX idx_equipment_strategy_type ON equipment_strategy(strategy_type);
CREATE INDEX idx_equipment_strategy_active ON equipment_strategy(is_active);
CREATE INDEX idx_task_generation_strategy ON task_generation_log(strategy_id);
CREATE INDEX idx_task_generation_date ON task_generation_log(generated_date);
CREATE INDEX idx_task_generation_next_date ON task_generation_log(next_generation_date);
CREATE INDEX idx_staff_skills_staff ON staff_skills(staff_id);
CREATE INDEX idx_staff_skills_area ON staff_skills(area);

-- 6. RLS and Policies
ALTER TABLE equipment_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON equipment_strategy FOR ALL USING (true);
CREATE POLICY "Allow all access" ON task_generation_log FOR ALL USING (true);
CREATE POLICY "Allow all access" ON staff_skills FOR ALL USING (true);

-- 7. Functions to calculate next generation date
CREATE OR REPLACE FUNCTION calculate_next_generation_date(
    frequency_type VARCHAR(20),
    frequency_value INTEGER,
    last_date DATE DEFAULT CURRENT_DATE
) RETURNS DATE AS $$
BEGIN
    CASE frequency_type
        WHEN 'DAILY' THEN RETURN last_date + (frequency_value || ' days')::INTERVAL;
        WHEN 'WEEKLY' THEN RETURN last_date + (frequency_value || ' weeks')::INTERVAL;
        WHEN 'MONTHLY' THEN RETURN last_date + (frequency_value || ' months')::INTERVAL;
        WHEN 'QUARTERLY' THEN RETURN last_date + (frequency_value * 3 || ' months')::INTERVAL;
        WHEN 'ANNUAL' THEN RETURN last_date + (frequency_value || ' years')::INTERVAL;
        ELSE RETURN last_date + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to generate work order ID
CREATE OR REPLACE FUNCTION generate_work_order_id() RETURNS VARCHAR(10) AS $$
DECLARE
    new_id VARCHAR(10);
    counter INTEGER;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING("作業指示ID" FROM 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM work_order
    WHERE "作業指示ID" LIKE 'WO%';
    
    -- Format as WO001, WO002, etc.
    new_id := 'WO' || LPAD(counter::TEXT, 3, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;