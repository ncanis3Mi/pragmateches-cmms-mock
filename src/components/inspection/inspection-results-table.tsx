import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InspectionResult } from "@/types/inspection"
import { cn } from "@/lib/utils"

interface InspectionResultsTableProps {
  data: InspectionResult[]
  title: string
}

function getStatusBadge(status?: string) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  
  switch (status) {
    case "合格":
      return (
        <span className={cn(baseClasses, "bg-green-100 text-green-800")}>
          合格
        </span>
      )
    case "不合格":
      return (
        <span className={cn(baseClasses, "bg-red-100 text-red-800")}>
          不合格
        </span>
      )
    case "要確認":
      return (
        <span className={cn(baseClasses, "bg-yellow-100 text-yellow-800")}>
          要確認
        </span>
      )
    default:
      return (
        <span className={cn(baseClasses, "bg-gray-100 text-gray-800")}>
          未確認
        </span>
      )
  }
}

export function InspectionResultsTable({ data, title }: InspectionResultsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            検査結果 - {title}
          </h1>
          <p className="text-gray-600 mt-1">
            {title}の検査結果一覧を表示しています
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {data.length}件の結果
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>機器No</TableHead>
              <TableHead>コンポーネント</TableHead>
              <TableHead>測定点</TableHead>
              <TableHead>検査日</TableHead>
              <TableHead>ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.equipmentNo}
                </TableCell>
                <TableCell>{item.component}</TableCell>
                <TableCell>{item.measurementPoint}</TableCell>
                <TableCell>{item.inspectionDate}</TableCell>
                <TableCell>
                  {getStatusBadge(item.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 