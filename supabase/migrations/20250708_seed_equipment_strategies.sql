-- ============================================
-- Sample Equipment Strategies and Staff Skills Data
-- ============================================

-- Insert sample equipment strategies
INSERT INTO equipment_strategy (
    strategy_id, equipment_id, strategy_name, strategy_type, frequency_type, frequency_value,
    estimated_duration_hours, required_skill_level, required_area, task_description,
    safety_requirements, tools_required, parts_required, priority
) VALUES 
-- Static Equipment Strategies
('ES001', 'TK-101', 'Daily Pressure Check', 'PREVENTIVE', 'DAILY', 1, 0.5, 'BASIC', '第1工場A棟', 
 'Check tank pressure levels and log readings. Verify pressure is within normal operating range.',
 'Use proper PPE. Check for gas leaks before inspection.', 'Pressure gauge, logbook', 'None', 'HIGH'),

('ES002', 'TK-101', 'Weekly Visual Inspection', 'PREVENTIVE', 'WEEKLY', 1, 1.0, 'BASIC', '第1工場A棟',
 'Visual inspection of tank exterior for corrosion, leaks, and structural integrity.',
 'Lockout/tagout if required. Use fall protection for elevated inspection.', 'Flashlight, inspection checklist', 'None', 'MEDIUM'),

('ES003', 'TK-101', 'Monthly Thickness Measurement', 'PREDICTIVE', 'MONTHLY', 1, 2.0, 'INTERMEDIATE', '第1工場A棟',
 'Ultrasonic thickness measurement at designated points. Record measurements and compare to baseline.',
 'Confined space entry procedures if required.', 'Ultrasonic thickness gauge, data logger', 'None', 'HIGH'),

('ES004', 'TK-102', 'Quarterly Valve Maintenance', 'PREVENTIVE', 'QUARTERLY', 1, 4.0, 'INTERMEDIATE', '第1工場B棟',
 'Inspect and lubricate all valves. Test emergency shutdown valves. Replace worn seals.',
 'Lock out all energy sources. Use proper lifting techniques.', 'Valve grease, seal kit, torque wrench', 'Valve seals, gaskets', 'MEDIUM'),

('ES005', 'EQ001', 'Annual Overhaul', 'PREVENTIVE', 'ANNUAL', 1, 16.0, 'EXPERT', '第1工場A棟',
 'Complete disassembly, inspection, and rebuilding of equipment. Replace all wear parts.',
 'Hot work permit required. Use certified lifting equipment.', 'Complete toolset, lifting equipment', 'Overhaul kit, bearings, seals', 'CRITICAL'),

-- Heat Exchanger Strategies  
('ES006', 'HX-101', 'Weekly Tube Cleaning', 'PREVENTIVE', 'WEEKLY', 2, 3.0, 'BASIC', '第2工場', 
 'Clean heat exchanger tubes using chemical cleaning solution. Check for blockages.',
 'Use respiratory protection with chemicals.', 'Cleaning chemicals, brushes', 'Cleaning solution', 'MEDIUM'),

('ES007', 'HX-102', 'Monthly Performance Check', 'CONDITION_BASED', 'MONTHLY', 1, 1.5, 'INTERMEDIATE', '第2工場',
 'Monitor heat transfer efficiency. Check inlet/outlet temperatures and flow rates.',
 'Standard PPE required.', 'Temperature guns, flow meter', 'None', 'MEDIUM'),

-- Pump Strategies
('ES008', 'PU-100', 'Daily Vibration Check', 'PREDICTIVE', 'DAILY', 1, 0.25, 'BASIC', '第3工場',
 'Check pump vibration levels and bearing temperatures. Log readings.',
 'Hearing protection required near running equipment.', 'Vibration meter, thermometer', 'None', 'HIGH'),

('ES009', 'PU-101', 'Monthly Lubrication', 'PREVENTIVE', 'MONTHLY', 1, 1.0, 'BASIC', '第3工場',
 'Lubricate all grease points according to lubrication schedule.',
 'Lock out pump before maintenance.', 'Grease gun, lubricants', 'Bearing grease', 'MEDIUM'),

('ES010', 'PU-102', 'Quarterly Alignment Check', 'PREVENTIVE', 'QUARTERLY', 1, 3.0, 'EXPERT', '第3工場',
 'Check and adjust pump-motor alignment using laser alignment tools.',
 'Electrical lockout required.', 'Laser alignment tool, shims', 'Alignment shims', 'MEDIUM');

-- Insert sample staff skills
INSERT INTO staff_skills (staff_id, skill_type, skill_level, area, is_available) VALUES
-- Using actual staff IDs from staff_master table
('ST001', 'MECHANICAL', 'EXPERT', '第1工場A棟', true),
('ST001', 'PRESSURE_SYSTEMS', 'EXPERT', '第1工場A棟', true),
('ST002', 'MECHANICAL', 'INTERMEDIATE', '第1工場B棟', true),
('ST002', 'VALVE_MAINTENANCE', 'EXPERT', '第1工場B棟', true),
('ST003', 'INSPECTION', 'BASIC', '第1工場A棟', true),
('ST003', 'THICKNESS_MEASUREMENT', 'INTERMEDIATE', '第1工場A棟', true),
('ST004', 'HEAT_EXCHANGERS', 'INTERMEDIATE', '第2工場', true),
('ST004', 'CHEMICAL_CLEANING', 'BASIC', '第2工場', true),
('ST005', 'PUMPS', 'EXPERT', '第3工場', true),
('ST005', 'VIBRATION_ANALYSIS', 'INTERMEDIATE', '第3工場', true),
('ST006', 'ALIGNMENT', 'EXPERT', '第3工場', true),
('ST006', 'LASER_TOOLS', 'EXPERT', '第3工場', true);

-- Initialize task generation log with first entries (optional)
-- This sets up the initial schedule for task generation
INSERT INTO task_generation_log (strategy_id, generated_date, next_generation_date, status, generation_notes) 
SELECT 
    strategy_id,
    CURRENT_DATE - INTERVAL '1 day' as generated_date,
    CASE 
        WHEN frequency_type = 'DAILY' THEN CURRENT_DATE
        WHEN frequency_type = 'WEEKLY' THEN CURRENT_DATE + INTERVAL '3 days'
        WHEN frequency_type = 'MONTHLY' THEN CURRENT_DATE + INTERVAL '1 week'
        WHEN frequency_type = 'QUARTERLY' THEN CURRENT_DATE + INTERVAL '1 month'
        WHEN frequency_type = 'ANNUAL' THEN CURRENT_DATE + INTERVAL '6 months'
    END as next_generation_date,
    'INITIAL_SETUP' as status,
    'Initial schedule setup' as generation_notes
FROM equipment_strategy
WHERE is_active = true;