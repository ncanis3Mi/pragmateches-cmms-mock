import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionResultsTable } from "@/components/inspection/inspection-results-table"
import { precisionEquipmentData } from "@/types/inspection"

export default function PrecisionEquipmentPage() {
  return (
    <DashboardLayout>
      <InspectionResultsTable data={precisionEquipmentData} title="精機器" />
    </DashboardLayout>
  )
} 