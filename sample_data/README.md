# CMMS Sample Data

This directory contains comprehensive sample data for the Computerized Maintenance Management System (CMMS) mock application.

## Data Structure Overview

### Master Data Tables
1. **equipment_type_master.csv** - 設備種別マスタ
   - Equipment type definitions (precision, rotating, electrical, instrumentation, etc.)
   - 8 equipment types

2. **work_type_master.csv** - 作業種別マスタ
   - Work type definitions (daily inspection, scheduled maintenance, preventive maintenance, etc.)
   - 10 work types with standard work hours

3. **staff_master.csv** - 担当者マスタ
   - Staff member information with specializations
   - 10 staff members across different departments

4. **contractor_master.csv** - 業者マスタ
   - Contractor information with specializations and contract periods
   - 8 contractors covering different equipment types

5. **inspection_cycle_master.csv** - 点検周期マスタ
   - Inspection cycle definitions (daily, weekly, monthly, quarterly, etc.)
   - 10 cycle types from daily to 3-year intervals

### Operational Data Tables
6. **equipment.csv** - 設備
   - 20 pieces of equipment across different types and locations
   - Includes precision machines, rotating equipment, electrical systems, etc.

7. **work_order.csv** - 作業指示
   - 15 work orders with various statuses (completed, planned)
   - Mix of routine inspections, preventive maintenance, and repairs

8. **maintenance_history.csv** - 保全履歴
   - 15 historical maintenance records
   - Includes actual work times, costs, and results

9. **inspection_plan.csv** - 点検計画
   - 20 inspection plans with different cycles and items
   - Links equipment to inspection schedules

10. **anomaly_report.csv** - 異常報告
    - 15 anomaly reports with various severity levels
    - Includes resolved and ongoing issues

## Key Relationships
- Equipment → Work Orders → Maintenance History
- Equipment → Inspection Plans
- Equipment → Anomaly Reports
- Staff assigned to work orders and maintenance
- Equipment types define specialization requirements

## Data Characteristics
- **Time Range**: Data spans from 2023 to 2024
- **Equipment Variety**: CNC machines, pumps, transformers, sensors, etc.
- **Realistic Values**: Based on actual industrial equipment and maintenance practices
- **Status Variety**: Mix of completed, planned, and ongoing activities
- **Cost Information**: Realistic maintenance costs and labor hours

## Usage
This sample data can be used to:
- Test the CMMS application functionality
- Demonstrate reporting capabilities
- Train AI models for maintenance insights
- Validate data relationships and constraints
- Support development and testing activities

All CSV files use UTF-8 encoding and include Japanese field names and content appropriate for a Japanese industrial facility.