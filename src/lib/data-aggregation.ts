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
    // Parse the JSON response containing data requirements
    const requirements = JSON.parse(result.result)
    return requirements
  } catch (error) {
    console.error('Failed to parse data requirements:', error)
    // Fallback to default requirements
    return {
      tables: ['equipment', 'maintenance_history'],
      fields: ['設備名', '実施日', 'コスト'],
      aggregations: ['monthly_costs', 'equipment_totals'],
    }
  }
}

// Aggregate data based on AI requirements
export async function aggregateRequestedData(categoryTypeId: number, requirements: DataRequirements): Promise<any> {
  const { supabase } = await import('@/lib/supabase')
  
  // Base query for equipment
  let query = supabase
    .from('equipment')
    .select('*')
    .eq('設備種別ID', categoryTypeId)

  // Add related tables based on requirements
  if (requirements.tables.includes('maintenance_history')) {
    query = supabase
      .from('equipment')
      .select(`
        設備ID,
        設備名,
        重要度,
        稼働状態,
        maintenance_history(*)
      `)
      .eq('設備種別ID', categoryTypeId)
  }

  const { data: equipmentData } = await query

  if (!equipmentData) return {}

  // Perform aggregations based on requirements
  const aggregatedData: any = {}

  // Monthly cost aggregation
  if (requirements.aggregations.includes('monthly_costs')) {
    aggregatedData.monthly_costs = aggregateMonthlyMaintenanceCosts(equipmentData)
  }

  // Equipment totals
  if (requirements.aggregations.includes('equipment_totals')) {
    aggregatedData.equipment_totals = aggregateEquipmentTotals(equipmentData)
  }

  // Anomaly severity distribution
  if (requirements.aggregations.includes('anomaly_severity')) {
    const { data: anomalyData } = await supabase
      .from('anomaly_report')
      .select('重大度, 設備ID')
      .in('設備ID', equipmentData.map(eq => eq.設備ID))
    
    aggregatedData.anomaly_severity = aggregateAnomalySeverity(anomalyData || [])
  }

  // Time series data
  if (requirements.time_grouping) {
    aggregatedData.time_series = await aggregateTimeSeriesData(
      equipmentData,
      requirements.time_grouping
    )
  }

  return aggregatedData
}

// Helper aggregation functions
function aggregateMonthlyMaintenanceCosts(equipmentData: any[]): any[] {
  const monthlyData: { [key: string]: number } = {}
  
  equipmentData.forEach(equipment => {
    equipment.maintenance_history?.forEach((maintenance: any) => {
      const date = new Date(maintenance.実施日)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (maintenance.コスト || 0)
    })
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