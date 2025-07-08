import { supabase } from './supabase'
import type { 
  Equipment, 
  MaintenanceHistory, 
  AnomalyReport, 
  InspectionPlan,
  WorkOrder 
} from './supabase'

// Equipment operations
export async function getEquipment() {
  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      equipment_type_master(設備種別名)
    `)
    .order('設備ID')
  
  if (error) throw error
  return data
}

export async function getEquipmentById(equipmentId: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      equipment_type_master(設備種別名)
    `)
    .eq('設備ID', equipmentId)
    .single()
  
  if (error) throw error
  return data
}

// Maintenance History operations
export async function getMaintenanceHistory(equipmentId?: string) {
  let query = supabase
    .from('maintenance_history')
    .select(`
      *,
      equipment(設備名, 設備タグ),
      staff_master(氏名),
      work_order(作業内容)
    `)
    .order('実施日', { ascending: false })
  
  if (equipmentId) {
    query = query.eq('設備ID', equipmentId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// Anomaly Reports operations
export async function getAnomalyReports(status?: string) {
  let query = supabase
    .from('anomaly_report')
    .select(`
      *,
      equipment(設備名, 設備タグ),
      staff_master(氏名)
    `)
    .order('発生日時', { ascending: false })
  
  if (status) {
    query = query.eq('状態', status)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// Work Orders operations
export async function getWorkOrders(status?: string) {
  let query = supabase
    .from('work_order')
    .select(`
      *,
      equipment(設備名, 設備タグ),
      work_type_master(作業種別名),
      staff_master(氏名)
    `)
    .order('計画開始日時', { ascending: false })
  
  if (status) {
    query = query.eq('状態', status)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// Inspection Plans operations
export async function getInspectionPlans() {
  const { data, error } = await supabase
    .from('inspection_plan')
    .select(`
      *,
      equipment(設備名, 設備タグ),
      inspection_cycle_master(周期名),
      staff_master(氏名)
    `)
    .order('次回点検日')
  
  if (error) throw error
  return data
}

// Dashboard statistics
export async function getDashboardStats() {
  const [
    equipmentCount,
    activeWorkOrders,
    pendingAnomalies,
    upcomingInspections
  ] = await Promise.all([
    supabase.from('equipment').select('設備ID', { count: 'exact', head: true }),
    supabase.from('work_order').select('作業指示ID', { count: 'exact', head: true }).eq('状態', '計画中'),
    supabase.from('anomaly_report').select('報告ID', { count: 'exact', head: true }).eq('状態', '対応中'),
    supabase.from('inspection_plan').select('計画ID', { count: 'exact', head: true }).lte('次回点検日', new Date().toISOString().split('T')[0])
  ])

  return {
    totalEquipment: equipmentCount.count || 0,
    activeWorkOrders: activeWorkOrders.count || 0,
    pendingAnomalies: pendingAnomalies.count || 0,
    upcomingInspections: upcomingInspections.count || 0
  }
}

// AI data for ChatGPT features
export async function getEquipmentDataForAI(categoryFilter?: string) {
  let query = supabase
    .from('equipment')
    .select(`
      *,
      equipment_type_master(設備種別名),
      maintenance_history(*),
      anomaly_report(*),
      inspection_plan(*)
    `)
  
  if (categoryFilter) {
    query = query.eq('equipment_type_master.設備種別名', categoryFilter)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}