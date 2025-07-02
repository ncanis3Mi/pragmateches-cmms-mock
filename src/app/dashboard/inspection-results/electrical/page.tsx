import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionResultsTable } from "@/components/inspection/inspection-results-table"
import { electricalData } from "@/types/inspection"

export default function ElectricalPage() {
  return (
    <DashboardLayout>
      <InspectionResultsTable data={electricalData} title="電気" />
    </DashboardLayout>
  )
} 