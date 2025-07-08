const fs = require('fs');
const path = require('path');

function csvToSql(csvFilePath, tableName) {
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  // Quote all headers for Supabase compatibility
  const quotedHeaders = headers.map(h => `"${h}"`);
  
  let sql = `-- Insert data for ${tableName}\n`;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const formattedValues = values.map((value, index) => {
      // Handle empty values
      if (value === '' || value === null || value === undefined) {
        return 'NULL';
      }
      
      // Handle numeric columns (simple heuristic)
      if (headers[index].includes('ID') || headers[index].includes('時間') || 
          headers[index].includes('日数') || headers[index].includes('コスト') ||
          headers[index] === '作業時間') {
        return value;
      }
      
      // Handle date/timestamp columns
      if (headers[index].includes('日') && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return `'${value}'`;
      }
      
      // Default to string
      return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    });
    
    sql += `INSERT INTO ${tableName} (${quotedHeaders.join(', ')}) VALUES (${formattedValues.join(', ')});\n`;
  }
  
  return sql + '\n';
}

// Process all CSV files
const sampleDataDir = path.join(__dirname, '../sample_data');
const files = [
  { file: 'equipment_type_master.csv', table: 'equipment_type_master' },
  { file: 'work_type_master.csv', table: 'work_type_master' },
  { file: 'staff_master.csv', table: 'staff_master' },
  { file: 'contractor_master.csv', table: 'contractor_master' },
  { file: 'inspection_cycle_master.csv', table: 'inspection_cycle_master' },
  { file: 'equipment.csv', table: 'equipment' },
  { file: 'work_order.csv', table: 'work_order' },
  { file: 'maintenance_history.csv', table: 'maintenance_history' },
  { file: 'inspection_plan.csv', table: 'inspection_plan' },
  { file: 'anomaly_report.csv', table: 'anomaly_report' }
];

let allSql = '-- Complete CMMS sample data from CSV files\n-- Based on data model: https://github.com/ncanis3Mi/pragmateches-cmms-mock/blob/main/docs/data_model.md\n\n';

// Skip master tables if they already exist, add remaining data
allSql += '-- Note: Master table data might already exist, use ON CONFLICT DO NOTHING if needed\n\n';

files.forEach(({ file, table }) => {
  const csvPath = path.join(sampleDataDir, file);
  if (fs.existsSync(csvPath)) {
    allSql += csvToSql(csvPath, table);
  }
});

console.log(allSql);