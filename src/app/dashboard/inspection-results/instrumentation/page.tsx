"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionResultsTable } from "@/components/inspection/inspection-results-table"
import { supabase } from "@/lib/supabase"

export default function InstrumentationPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: inspectionData, error } = await supabase
        .from('inspection_plan')
        .select(`
          *,
          equipment!inner(
            設備名,
            設備タグ,
            設備種別ID
          ),
          inspection_cycle_master(周期名),
          staff_master(氏名)
        `)
        .eq('equipment.設備種別ID', 4) // 4 = 計装設備
        .order('次回点検日', { ascending: true })

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        // Transform data to match the expected format
        const transformedData = inspectionData?.map(item => ({
          equipmentNo: item.equipment?.設備タグ || '',
          component: item.equipment?.設備名 || '',
          measurementPoint: item.点検項目 || '',
          inspectionDate: item.次回点検日 || '',
          status: item.状態 === '完了' ? '合格' : item.状態 === '計画済' ? '要確認' : '不合格'
        })) || []
        
        setData(transformedData)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <InspectionResultsTable data={data} title="計装" />
    </DashboardLayout>
  )
}