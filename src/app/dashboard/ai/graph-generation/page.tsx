"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDataSchema, askForDataRequirements, aggregateRequestedData } from "@/lib/data-aggregation"
import { UniversalChart } from '@/components/charts/universal-chart'
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
  { value: "precision", label: "静機器", typeId: 1 },
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
      // Handle both Chart.js and Plotly configurations
      if (config.library === 'plotly') {
        configs.push(config)
      } else {
        // Convert Chart.js v2 syntax to v4 syntax
        const convertedConfig = convertChartJSConfig(config)
        configs.push(convertedConfig)
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e)
    }
  }
  
  return configs
}

// Convert Chart.js v2 syntax to v4 syntax
function convertChartJSConfig(config: any): any {
  const converted = { ...config }
  
  if (converted.options?.scales) {
    const scales = converted.options.scales
    const newScales: any = {}
    
    // Convert yAxes to y
    if (scales.yAxes && Array.isArray(scales.yAxes)) {
      newScales.y = scales.yAxes[0]
      delete scales.yAxes
    }
    
    // Convert xAxes to x
    if (scales.xAxes && Array.isArray(scales.xAxes)) {
      newScales.x = scales.xAxes[0]
      delete scales.xAxes
    }
    
    // Merge with existing scales
    converted.options.scales = { ...scales, ...newScales }
  }
  
  // Convert title from root level to plugins
  if (converted.options?.title) {
    if (!converted.options.plugins) {
      converted.options.plugins = {}
    }
    converted.options.plugins.title = converted.options.title
    delete converted.options.title
  }
  
  return converted
}

export default function GraphGenerationPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [graphRequest, setGraphRequest] = useState("")
  const [loading, setLoading] = useState(false)
  const [graphConfig, setGraphConfig] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [error, setError] = useState("")
  const [conversationLog, setConversationLog] = useState<any[]>([])
  const [useDirectAccess, setUseDirectAccess] = useState(false)

  const handleGenerateGraph = async () => {
    if (!selectedCategory || !graphRequest) {
      setError("カテゴリーとグラフの要求を入力してください")
      return
    }

    setLoading(true)
    setError("")
    setGraphConfig(null)
    setConversationLog([])

    const selectedCategory_info = dataCategories.find(c => c.value === selectedCategory)
    
    try {
      const log: any[] = []
      
      // Step 1: Get data schema for the selected category
      const dataSchema = await getDataSchema(selectedCategory_info!.typeId)
      log.push({
        step: 1,
        action: "データスキーマ取得",
        timestamp: new Date().toLocaleTimeString(),
        details: {
          category: selectedCategory_info!.label,
          equipment_count: dataSchema.equipment_count,
          date_range: dataSchema.date_range
        }
      })
      
      // Step 2: Ask AI what data it needs for this specific graph request
      const dataRequirements = await askForDataRequirements(dataSchema, graphRequest)
      log.push({
        step: 2,
        action: "AI データ要求分析",
        timestamp: new Date().toLocaleTimeString(),
        request: graphRequest,
        response: dataRequirements
      })
      
      // Step 3: Get data based on selected approach
      let dataForAI: any
      
      if (useDirectAccess) {
        // Direct approach: Send raw data with schema
        const aggregatedData = await aggregateRequestedData(selectedCategory_info!.typeId, dataRequirements)
        if (!aggregatedData) {
          throw new Error('No data returned from aggregation')
        }
        dataForAI = aggregatedData
      } else {
        // Pre-aggregated approach: Use reduced data approach
        const aggregatedData = await aggregateRequestedData(selectedCategory_info!.typeId, dataRequirements)
        if (!aggregatedData) {
          throw new Error('No data returned from aggregation')
        }
        
        // Send only processed/aggregated data (smaller payload)
        dataForAI = {
          equipment: aggregatedData.equipment?.slice(0, 10),
          // Add pre-processed versions if available
          summary: {
            equipment_count: aggregatedData.equipment?.length || 0,
            tables_available: Object.keys(aggregatedData).filter(key => key !== 'schema')
          }
        }
        
        // Add specific table data in smaller chunks
        for (const [key, value] of Object.entries(aggregatedData)) {
          if (key !== 'schema' && key !== 'equipment' && Array.isArray(value)) {
            dataForAI[key] = (value as any[]).slice(0, 50) // Limit to 50 records
          }
        }
      }
      log.push({
        step: 3,
        action: "データ集約",
        timestamp: new Date().toLocaleTimeString(),
        details: {
          approach: useDirectAccess ? "Direct Data Access" : "Pre-aggregated",
          data_keys: Object.keys(dataForAI),
          data_size: JSON.stringify(dataForAI).length + " bytes"
        }
      })
      
      // Step 4: Generate the graph with the targeted data
      console.log('Sending to AI:', {
        approach: useDirectAccess ? "Direct Data Access" : "Pre-aggregated",
        data_keys: Object.keys(dataForAI),
        data_size: JSON.stringify(dataForAI).length + " bytes"
      })
      
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "graph",
          prompt: graphRequest,
          data: dataForAI,
        }),
      })

      const result = await response.json()
      log.push({
        step: 4,
        action: "AI グラフ生成",
        timestamp: new Date().toLocaleTimeString(),
        request: {
          type: "graph",
          prompt: graphRequest,
          data_summary: "集約されたデータ"
        },
        response: {
          result: result.result ? result.result.substring(0, 200) + "..." : "エラー",
          usage: result.usage
        }
      })

      setConversationLog(log)

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
    } catch (err: any) {
      console.error('Graph generation error:', err)
      // Display more specific error message if available
      if (err?.message) {
        setError(`エラー: ${err.message}`)
      } else {
        setError("エラーが発生しました。もう一度お試しください。")
      }
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

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="directAccess"
              checked={useDirectAccess}
              onChange={(e) => setUseDirectAccess(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="directAccess" className="text-sm font-medium">
              Alternative Approach - Direct Data Access
            </label>
            <span className="text-xs text-gray-500">
              (より柔軟な分析、より多くのトークン使用)
            </span>
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
                <UniversalChart config={config} height={400} />
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

      {conversationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>OpenAI API 会話ログ</CardTitle>
            <CardDescription>
              マルチターン処理の詳細とOpenAI APIとの通信内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversationLog.map((log, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      ステップ {log.step}
                    </span>
                    <span className="text-sm text-gray-600">{log.timestamp}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{log.action}</h4>
                  
                  {log.details && (
                    <div className="bg-gray-50 p-3 rounded mb-2">
                      <h5 className="text-sm font-medium mb-1">詳細:</h5>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.request && (
                    <div className="bg-green-50 p-3 rounded mb-2">
                      <h5 className="text-sm font-medium mb-1">リクエスト:</h5>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {typeof log.request === 'string' ? log.request : JSON.stringify(log.request, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.response && (
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="text-sm font-medium mb-1">レスポンス:</h5>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {typeof log.response === 'string' ? log.response : JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}