import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionResultsTable } from "@/components/inspection/inspection-results-table"
import { rotatingEquipmentData } from "@/types/inspection"

export default function RotatingEquipmentPage() {
  return (
    <DashboardLayout>
      <InspectionResultsTable data={rotatingEquipmentData} title="回転機" />
    </DashboardLayout>
  )
} 