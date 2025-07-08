// Data aggregation utilities for multi-turn OpenAI graph generation

export interface DataSchema {
  available_tables: {
    [tableName: string]: {
      fields: string[]
      sample_values: any[]
      description: string
    }
  }
  equipment_count: number
  date_range: string
  category: string
}

export interface DataRequirements {
  tables: string[]
  fields: string[]
  aggregations: string[]
  time_grouping?: string
  filters?: any
}

// Get data schema for a specific equipment category
export async function getDataSchema(categoryTypeId: number): Promise<DataSchema> {
  const { supabase } = await import('@/lib/supabase')
  
  // Get equipment count for this category
  const { count } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('設備種別ID', categoryTypeId)

  // Get date range from maintenance history
  const { data: dateRange } = await supabase
    .from('maintenance_history')
    .select('実施日')
    .order('実施日', { ascending: false })
    .limit(1)

  const { data: dateRangeStart } = await supabase
    .from('maintenance_history')
    .select('実施日')
    .order('実施日', { ascending: true })
    .limit(1)

  const categoryNames = {
    1: '静機器',
    2: '回転機', 
    3: '電気',
    4: '計装'
  }

  return {
    available_tables: {
      equipment: {
        fields: ['設備ID', '設備名', '設備種別ID', '設備タグ', '設置場所', '製造者', '型式', '設置年月日', '稼働状態', '重要度'],
        sample_values: ['EQ001', 'CNC旋盤1号機', 1, 'PE-001', '第1工場A棟', 'ヤマザキマザック', 'INTEGREX i-300', '2020-03-15', '稼働中', '高'],
        description: '設備の基本情報（名前、場所、製造者、重要度など）'
      },
      maintenance_history: {
        fields: ['履歴ID', '設備ID', '実施日', '作業内容', '作業結果', '使用部品', '作業時間', 'コスト', '次回推奨日'],
        sample_values: ['MH001', 'EQ001', '2024-01-15', '月次定期点検', '良好', 'なし', 7.25, 15000, '2024-02-15'],
        description: '設備のメンテナンス履歴（日付、作業内容、コスト、作業時間など）'
      },
      anomaly_report: {
        fields: ['報告ID', '設備ID', '発生日時', '異常種別', '重大度', '症状', '原因', '対処方法', '状態'],
        sample_values: ['AR001', 'EQ001', '2024-01-17 09:30:00', '異音', '中', '研削時に異音発生', 'ベアリング摩耗', 'ベアリング交換', '解決済'],
        description: '設備の異常・故障報告（異常種別、重大度、症状、解決状況など）'
      },
      inspection_plan: {
        fields: ['計画ID', '設備ID', '点検項目', '最終点検日', '次回点検日', '状態'],
        sample_values: ['IP001', 'EQ001', '月次点検', '2024-01-15', '2024-02-15', '完了'],
        description: '設備の点検計画（点検項目、点検日程、完了状況など）'
      }
    },
    equipment_count: count || 0,
    date_range: `${dateRangeStart?.[0]?.実施日 || '2024-01-01'} to ${dateRange?.[0]?.実施日 || '2024-12-31'}`,
    category: categoryNames[categoryTypeId as keyof typeof categoryNames] || '未知'
  }
}

// Ask OpenAI what data it needs for the specific graph request
export async function askForDataRequirements(schema: DataSchema, userRequest: string): Promise<DataRequirements> {
  const response = await fetch('/api/chatgpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'data_requirements',
      prompt: userRequest,
      schema: schema,
    }),
  })

  const result = await response.json()
  
  try {
    // Extract JSON from markdown code blocks if present
    let jsonString = result.result
    const jsonMatch = jsonString.match(/```json\n([\s\S]*?)```/)
    if (jsonMatch) {
      jsonString = jsonMatch[1]
    }
    
    // Parse the JSON response containing data requirements
    const requirements = JSON.parse(jsonString)
    
    // Validate that we got proper arrays, not empty ones
    if (!requirements.tables || !Array.isArray(requirements.tables) || requirements.tables.length === 0) {
      throw new Error('Invalid or empty requirements returned')
    }
    
    return requirements
  } catch (error) {
    console.error('Failed to parse data requirements:', error)
    console.error('AI Response:', result.result)
    
    // Smart fallback based on user prompt
    if (userRequest.toLowerCase().includes('thickness')) {
      return {
        tables: ['thickness_measurement', 'equipment'],
        fields: ['測定値(mm)', '検査日', '設備名'],
        aggregations: ['thickness_time_series'],
        time_grouping: 'daily',
        chart_type: 'line'
      }
    } else if (userRequest.toLowerCase().includes('risk') || userRequest.includes('リスク')) {
      return {
        tables: ['equipment_risk_assessment', 'equipment'],
        fields: ['影響度ランク (5段階)', '信頼性ランク (5段階)', '設備名'],
        aggregations: ['risk_matrix'],
        chart_type: 'heatmap'
      }
    }
    
    // Default fallback
    return {
      tables: ['equipment', 'maintenance_history'],
      fields: ['設備名', '実施日', 'コスト'],
      aggregations: ['monthly_costs', 'equipment_totals'],
      time_grouping: 'monthly',
      chart_type: 'bar'
    }
  }
}

// Fetch raw data based on AI requirements  
export async function aggregateRequestedData(categoryTypeId: number, requirements: DataRequirements): Promise<any> {
  const { supabase } = await import('@/lib/supabase')
  
  console.log('Requirements received:', requirements)
  
  // Base query for equipment
  const { data: equipmentData } = await supabase
    .from('equipment')
    .select('設備ID, 設備名, 重要度, 稼働状態, 設備種別ID')
    .eq('設備種別ID', categoryTypeId)

  if (!equipmentData || equipmentData.length === 0) {
    console.log('No equipment found for category:', categoryTypeId)
    return {}
  }

  console.log('Found equipment:', equipmentData.length, 'items')

  // Prepare raw data with smart sampling
  const rawData: any = {
    equipment: equipmentData.slice(0, 50), // Limit equipment records
    schema: {
      equipment: {
        columns: ['設備ID', '設備名', '重要度', '稼働状態', '設備種別ID'],
        primary_key: '設備ID',
        description: 'Equipment master data'
      }
    }
  }

  const equipmentIds = equipmentData.map(eq => eq.設備ID)

  // Fetch requested tables with smart sampling
  const requestedTables = requirements.tables || []
  
  // If no specific tables requested, fetch common tables for inspection data
  const tablesToFetch = requestedTables.length > 0 ? requestedTables : ['inspection_plan', 'maintenance_history']
  
  for (const table of tablesToFetch) {
    try {
      if (table === 'equipment') continue // Already loaded

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .in('設備ID', equipmentIds)
        .limit(200) // Smart sampling - limit records per table

      if (error) {
        console.error(`Error fetching ${table}:`, error)
        continue
      }

      console.log(`Fetched ${table}:`, data?.length || 0, 'records')
      
      // Add to raw data
      rawData[table] = data || []
      
      // Add schema info
      if (data && data.length > 0) {
        rawData.schema[table] = {
          columns: Object.keys(data[0]),
          sample_record: data[0],
          record_count: data.length,
          description: getTableDescription(table)
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${table}:`, err)
    }
  }

  // Monthly cost aggregation
  if (requirements.aggregations.includes('monthly_costs')) {
    const maintenanceData = rawData.maintenance_history || []
    rawData.monthly_costs = aggregateMonthlyMaintenanceCosts(equipmentData, maintenanceData)
  }

  // Equipment totals
  if (requirements.aggregations.includes('equipment_totals')) {
    rawData.equipment_totals = aggregateEquipmentTotals(equipmentData)
  }

  // Anomaly severity distribution
  if (requirements.aggregations.includes('anomaly_severity')) {
    const { data: anomalyData } = await supabase
      .from('anomaly_report')
      .select('重大度, 設備ID')
      .in('設備ID', equipmentData.map(eq => eq.設備ID))
    
    rawData.anomaly_severity = aggregateAnomalySeverity(anomalyData || [])
  }

  // Thickness time series
  if (requirements.aggregations.includes('thickness_time_series')) {
    console.log('Fetching thickness data for equipment IDs:', equipmentData.map(eq => eq.設備ID))
    
    // First, check what equipment IDs exist in thickness_measurement table
    const { data: allThicknessData } = await supabase
      .from('thickness_measurement')
      .select('設備ID')
      .limit(10)
    console.log('Sample thickness measurement equipment IDs:', allThicknessData?.map(d => d.設備ID))
    
    const { data: thicknessData, error } = await supabase
      .from('thickness_measurement')
      .select('*')
      .in('設備ID', equipmentData.map(eq => eq.設備ID))
      .order('検査日', { ascending: true })
    
    if (error) {
      console.error('Error fetching thickness data:', error)
    } else {
      console.log('Fetched thickness data:', thicknessData?.length || 0, 'records')
      if (thicknessData && thicknessData.length > 0) {
        console.log('Sample thickness data:', thicknessData[0])
      }
    }
    
    rawData.thickness_measurement = thicknessData || []
    rawData.thickness_time_series = aggregateThicknessTimeSeries(thicknessData || [])
    console.log('Processed thickness_time_series length:', rawData.thickness_time_series.length)
  }

  // Risk matrix
  if (requirements.aggregations.includes('risk_matrix')) {
    const { data: riskData, error } = await supabase
      .from('equipment_risk_assessment')
      .select('*')
      .in('設備ID', equipmentData.map(eq => eq.設備ID))
    
    if (error) {
      console.error('Error fetching risk data:', error)
    } else {
      console.log('Fetched risk data:', riskData?.length || 0, 'records')
    }
    
    rawData.equipment_risk_assessment = riskData || []
    rawData.risk_matrix = aggregateRiskMatrix(riskData || [])
  }

  // Time series data
  if (requirements.time_grouping) {
    rawData.time_series = await aggregateTimeSeriesData(
      equipmentData,
      requirements.time_grouping
    )
  }

  return rawData
}

// Helper function to provide table descriptions
function getTableDescription(tableName: string): string {
  const descriptions: { [key: string]: string } = {
    'maintenance_history': '設備のメンテナンス履歴（実施日、コスト、作業内容）',
    'thickness_measurement': '肉厚測定データ（測定値、検査日、測定点）',
    'equipment_risk_assessment': 'リスク評価データ（影響度、信頼性、リスクスコア）',
    'inspection_plan': '点検計画データ（点検日、状態、点検項目）',
    'anomaly_report': '異常報告データ（発生日時、重大度、症状）'
  }
  return descriptions[tableName] || `${tableName}のデータ`
}

// Helper aggregation functions
function aggregateMonthlyMaintenanceCosts(equipmentData: any[], maintenanceData: any[] = []): any[] {
  const monthlyData: { [key: string]: number } = {}
  
  maintenanceData.forEach(maintenance => {
    const date = new Date(maintenance.実施日)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (maintenance.コスト || 0)
  })

  return Object.entries(monthlyData).map(([month, cost]) => ({
    month,
    cost,
    month_label: `${month}月`
  }))
}

function aggregateEquipmentTotals(equipmentData: any[]): any[] {
  return equipmentData.map(equipment => ({
    設備ID: equipment.設備ID,
    設備名: equipment.設備名,
    重要度: equipment.重要度,
    maintenance_count: equipment.maintenance_history?.length || 0,
    total_maintenance_cost: equipment.maintenance_history?.reduce((sum: number, m: any) => sum + (m.コスト || 0), 0) || 0,
    avg_maintenance_cost: equipment.maintenance_history?.length > 0 
      ? equipment.maintenance_history.reduce((sum: number, m: any) => sum + (m.コスト || 0), 0) / equipment.maintenance_history.length
      : 0
  }))
}

function aggregateMonthlyInspections(inspectionData: any[]): any[] {
  const monthlyData: { [key: string]: { total: number, completed: number, pending: number } } = {}
  
  inspectionData.forEach(inspection => {
    const date = new Date(inspection.最終点検日 || inspection.次回点検日)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, completed: 0, pending: 0 }
    }
    
    monthlyData[monthKey].total++
    
    if (inspection.状態 === '完了') {
      monthlyData[monthKey].completed++
    } else {
      monthlyData[monthKey].pending++
    }
  })

  return Object.entries(monthlyData).map(([month, counts]) => ({
    month,
    month_label: `${month}月`,
    total_inspections: counts.total,
    completed_inspections: counts.completed,
    pending_inspections: counts.pending,
    completion_rate: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0
  })).sort((a, b) => a.month.localeCompare(b.month))
}

function aggregateAnomalySeverity(anomalyData: any[]): any[] {
  const severityCount: { [key: string]: number } = {}
  
  anomalyData.forEach(anomaly => {
    const severity = anomaly.重大度 || '不明'
    severityCount[severity] = (severityCount[severity] || 0) + 1
  })

  return Object.entries(severityCount).map(([severity, count]) => ({
    severity,
    count
  }))
}

async function aggregateTimeSeriesData(equipmentData: any[], timeGrouping: string): Promise<any[]> {
  // Implementation depends on time grouping type (daily, weekly, monthly, etc.)
  // This is a placeholder - implement based on specific requirements
  return []
}

function aggregateThicknessTimeSeries(thicknessData: any[]): any[] {
  // Group thickness measurements by date, equipment, and measurement point
  const timeSeriesData = thicknessData.map(measurement => ({
    date: measurement.検査日,
    equipment_id: measurement.設備ID,
    measurement_point: measurement.測定点ID,
    series_name: `${measurement.設備ID}-${measurement.測定点ID}`,
    thickness_value: measurement["測定値(mm)"],
    min_thickness: measurement["最小許容肉厚(mm)"],
    is_below_threshold: measurement["測定値(mm)"] < measurement["最小許容肉厚(mm)"]
  }))

  return timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function aggregateRiskMatrix(riskData: any[]): any {
  // Create matrix data for heatmap visualization
  const matrix: { [key: string]: number } = {}
  
  // Map text values to numeric values
  const textToNumber: { [key: string]: number } = {
    '非常に低い': 1,
    '低い': 2,
    '中程度': 3,
    '高い': 4,
    '非常に高い': 5,
    '小さい': 1,
    '中程度': 3,
    '大きい': 4,
    '非常に大きい': 5
  }
  
  riskData.forEach(risk => {
    // Handle both text and numeric values
    let impact = risk["影響度ランク（5段階）"] || risk["影響度ランク (5段階)"] || 1
    let reliability = risk["信頼性ランク（5段階）"] || risk["信頼性ランク (5段階)"] || 1
    
    // Convert text to numbers if needed
    if (typeof impact === 'string') {
      impact = textToNumber[impact] || 3
    }
    if (typeof reliability === 'string') {
      reliability = textToNumber[reliability] || 3
    }
    
    const key = `${impact}-${reliability}`
    matrix[key] = (matrix[key] || 0) + 1
  })

  // Convert to matrix format for Plotly heatmap
  const matrixData = []
  for (let impact = 1; impact <= 5; impact++) {
    const row = []
    for (let reliability = 1; reliability <= 5; reliability++) {
      const key = `${impact}-${reliability}`
      row.push(matrix[key] || 0)
    }
    matrixData.push(row)
  }

  return {
    z: matrixData,
    x: ['信頼性1', '信頼性2', '信頼性3', '信頼性4', '信頼性5'],
    y: ['影響度1', '影響度2', '影響度3', '影響度4', '影響度5'],
    type: 'heatmap',
    colorscale: 'YlOrRd',
    showscale: true
  }
}