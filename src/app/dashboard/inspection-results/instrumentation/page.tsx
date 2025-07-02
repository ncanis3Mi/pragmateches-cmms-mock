import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InspectionResultsTable } from "@/components/inspection/inspection-results-table"
import { instrumentationData } from "@/types/inspection"

export default function InstrumentationPage() {
  return (
    <DashboardLayout>
      <InspectionResultsTable data={instrumentationData} title="計装" />
    </DashboardLayout>
  )
} 