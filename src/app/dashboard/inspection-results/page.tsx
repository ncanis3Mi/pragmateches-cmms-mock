import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function InspectionResultsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              検査結果
            </h1>
            <p className="text-gray-600 mt-1">
              設備の検査結果を確認・管理できます
            </p>
          </div>
        </div>

        {/* プレースホルダーコンテンツ */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            検査結果機能
          </h3>
          <p className="text-gray-600 mt-2">
            この機能は現在開発中です。<br />
            将来的には設備の検査結果を表示・管理できるようになります。
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
} 