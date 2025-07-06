"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2'
import { Loader2 } from 'lucide-react'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
})

interface UniversalChartProps {
  config: any
  height?: string | number
}

export function UniversalChart({ config, height = 400 }: UniversalChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!config || !config.library) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">チャート設定が無効です</p>
      </div>
    )
  }

  // Chart.js charts
  if (config.library === 'chartjs') {
    const chartComponents = {
      bar: Bar,
      line: Line,
      pie: Pie,
      doughnut: Doughnut,
      radar: Radar,
      scatter: Scatter,
    }

    const ChartComponent = chartComponents[config.type as keyof typeof chartComponents]

    if (!ChartComponent) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500">サポートされていないChart.jsチャートタイプ: {config.type}</p>
        </div>
      )
    }

    return (
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ChartComponent 
          data={config.data} 
          options={{
            ...config.options,
            responsive: true,
            maintainAspectRatio: false,
          }} 
        />
      </div>
    )
  }

  // Plotly charts
  if (config.library === 'plotly' && isClient) {
    // Handle different Plotly data formats
    let plotData = []
    let layout = config.layout || {}

    if (config.type === 'heatmap' || config.type === 'matrix') {
      // For heatmap/matrix, data might be in a different format
      plotData = [{
        type: 'heatmap',
        z: config.data.z || config.data,
        x: config.data.x,
        y: config.data.y,
        text: config.data.text,
        texttemplate: config.data.texttemplate || '%{text}',
        textfont: { size: 14 },
        colorscale: config.data.colorscale || [
          [0, '#3B82F6'],
          [0.5, '#FDE047'],
          [1, '#DC2626']
        ],
        showscale: false,
        hoverongaps: false,
        ...config.data
      }]
    } else if (Array.isArray(config.data)) {
      plotData = config.data
    } else {
      // Convert single trace to array
      plotData = [{
        ...config.data,
        type: config.type
      }]
    }

    return (
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: typeof height === 'number' ? height : 400,
          margin: { l: 50, r: 50, t: 50, b: 50 },
          ...layout
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  return (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <p className="text-gray-500">不明なライブラリ: {config.library}</p>
    </div>
  )
}