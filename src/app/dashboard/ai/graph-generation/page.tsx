"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const dataCategories = [
  { value: "precision", label: "精機器", typeId: 1 },
  { value: "rotating", label: "回転機", typeId: 2 },
  { value: "electrical", label: "電気", typeId: 3 },
  { value: "instrumentation", label: "計装", typeId: 4 },
]

// Helper function to extract chart configurations from AI response
function extractChartConfigs(text: string): any[] {
  const jsonPattern = /```json\n([\s\S]*?)```/g
  const matches = text.matchAll(jsonPattern)
  const configs = []
  
  for (const match of matches) {
    try {
      const config = JSON.parse(match[1])
      configs.push(config)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
    }
  }
  
  return configs
}

export default function GraphGenerationPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [graphRequest, setGraphRequest] = useState("")
  const [loading, setLoading] = useState(false)
  const [graphConfig, setGraphConfig] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [error, setError] = useState("")

  const handleGenerateGraph = async () => {
    if (!selectedCategory || !graphRequest) {
      setError("カテゴリーとグラフの要求を入力してください")
      return
    }

    setLoading(true)
    setError("")
    setGraphConfig(null)

    const selectedCategory_info = dataCategories.find(c => c.value === selectedCategory)
    
    try {
      // Fetch real data from Supabase
      const { data: equipmentData, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_type_master("設備種別名"),
          maintenance_history(*),
          anomaly_report(*),
          inspection_plan(*)
        `)
        .eq('設備種別ID', selectedCategory_info?.typeId)
      
      if (error) throw error
      const filteredData = equipmentData || []

      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "graph",
          prompt: graphRequest,
          data: filteredData,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
      } else {
        // Parse the response to extract chart configurations
        const chartConfigs = extractChartConfigs(result.result)
        if (chartConfigs.length > 0) {
          setChartData(chartConfigs)
        } else {
          setGraphConfig({ text: result.result })
        }
      }
    } catch (err) {
      setError("エラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AIグラフ生成</h1>
        <p className="text-gray-600 mt-2">検査データからAIを使用してグラフを生成します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>グラフ生成設定</CardTitle>
          <CardDescription>
            生成したいグラフの種類やデータカテゴリーを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">データカテゴリー</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {dataCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">グラフの要求</label>
            <Textarea
              placeholder="例：月別の検査結果の推移を棒グラフで表示してください。合格・不合格・要確認の件数を比較できるようにしてください。"
              value={graphRequest}
              onChange={(e) => setGraphRequest(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <Button
            onClick={handleGenerateGraph}
            disabled={loading || !selectedCategory || !graphRequest}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                グラフを生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">生成されたグラフ</h2>
          {chartData.map((config, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>グラフ {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {config.type === 'bar' && <Bar data={config.data} options={config.options || {}} />}
                  {config.type === 'pie' && <Pie data={config.data} options={config.options || {}} />}
                  {config.type === 'line' && <Line data={config.data} options={config.options || {}} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {graphConfig && (
        <Card>
          <CardHeader>
            <CardTitle>生成されたグラフ設定</CardTitle>
            <CardDescription>
              以下の設定をChart.jsやRechartsなどのライブラリで使用できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(graphConfig, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}