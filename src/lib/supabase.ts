import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface EquipmentTypeMaster {
  設備種別ID: number
  設備種別名: string
  説明?: string
}

export interface WorkTypeMaster {
  作業種別ID: number
  作業種別名: string
  説明?: string
  標準作業時間?: number
}

export interface StaffMaster {
  担当者ID: string
  氏名: string
  部署?: string
  役職?: string
  専門分野?: string
  連絡先?: string
}

export interface ContractorMaster {
  業者ID: string
  業者名: string
  業者種別?: string
  専門分野?: string
  連絡先?: string
  担当者名?: string
  契約開始日?: string
  契約終了日?: string
}

export interface InspectionCycleMaster {
  周期ID: number
  周期名: string
  周期日数: number
  説明?: string
}

export interface Equipment {
  設備ID: string
  設備名: string
  設備種別ID?: number
  設備タグ: string
  設置場所?: string
  製造者?: string
  型式?: string
  設置年月日?: string
  稼働状態?: string
  重要度?: string
  created_at?: string
  updated_at?: string
}

export interface WorkOrder {
  作業指示ID: string
  設備ID?: string
  作業種別ID?: number
  作業内容: string
  優先度?: string
  計画開始日時?: string
  計画終了日時?: string
  実際開始日時?: string
  実際終了日時?: string
  作業者ID?: string
  状態?: string
  備考?: string
  created_at?: string
  updated_at?: string
}

export interface MaintenanceHistory {
  履歴ID: string
  設備ID?: string
  作業指示ID?: string
  実施日: string
  作業者ID?: string
  業者ID?: string
  作業内容?: string
  作業結果?: string
  使用部品?: string
  作業時間?: number
  コスト?: number
  次回推奨日?: string
  created_at?: string
  updated_at?: string
}

export interface InspectionPlan {
  計画ID: string
  設備ID?: string
  周期ID?: number
  点検項目: string
  最終点検日?: string
  次回点検日?: string
  担当者ID?: string
  状態?: string
  備考?: string
  created_at?: string
  updated_at?: string
}

export interface AnomalyReport {
  報告ID: string
  設備ID?: string
  発生日時: string
  発見者ID?: string
  異常種別: string
  重大度: string
  症状?: string
  原因?: string
  対処方法?: string
  状態?: string
  報告日時?: string
  解決日時?: string
  created_at?: string
  updated_at?: string
}