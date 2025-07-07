import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const { prompt, type, data, schema } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let systemPrompt = ''
    let userPrompt = prompt

    if (type === 'graph') {
      systemPrompt = `You are a data visualization expert. Generate chart configurations for inspection data. 

IMPORTANT: First determine which library to use:
- Use "library": "chartjs" for: bar, line, pie, doughnut, radar, scatter charts
- Use "library": "plotly" for: heatmap, matrix, 3D, sankey, treemap, box plot, or any complex visualization

You MUST return ONLY valid JSON configurations wrapped in markdown code blocks (using \`\`\`json). Do NOT include any explanatory text outside the JSON blocks. Each configuration MUST include:
{
  "library": "chartjs" or "plotly",
  "type": "chart type",
  "data": {...},
  "options": {...} (for chartjs) or "layout": {...} (for plotly)
}

For Chart.js, use v4 syntax:
- Use "scales": {"y": {"beginAtZero": true}} instead of "yAxes"
- Use "plugins": {"title": {"display": true, "text": "Title"}}

For Plotly, use standard Plotly.js format with data array and layout object.

IMPORTANT: Look for these data structures:
- thickness_data: Raw thickness measurement records
- thickness_time_series: Processed time series data with date, equipment_id, thickness_value
- risk_data: Raw risk assessment records
- risk_matrix: Pre-processed risk matrix data (use this directly for Plotly heatmap)
- equipment: Basic equipment information

If thickness_time_series exists, use it to create line charts grouped by equipment_id.
If risk_matrix exists, use it directly as Plotly heatmap data (it already has z, x, y arrays).

Remember: Return ONLY JSON code blocks, no explanatory text.`
      userPrompt = `Based on this inspection data: ${JSON.stringify(data)}, ${prompt}. 

IMPORTANT: 
1. Check if thickness_data or thickness_time_series exists in the data. If present, use that data to create the visualization.
2. The thickness_time_series contains processed data with date, equipment_id, and thickness_value fields.
3. Return ONLY JSON configurations in markdown code blocks. NO explanatory text.
4. If data is missing, still return a valid JSON configuration with empty data arrays.

Create the chart configuration now.`
    } else if (type === 'data_requirements') {
      systemPrompt = `You are a CMMS data analysis expert. Given a data schema and user request, determine exactly what data fields and aggregations are needed. Return ONLY a JSON object with the required data specifications.

IMPORTANT: Understand these key data sources:
- thickness_measurement: Contains 肉厚測定値(mm), 最小許容肉厚(mm), 測定値(mm), 検査日, 設備ID
- equipment_risk_assessment: Contains リスクスコア, リスクレベル, 影響度ランク, 信頼性ランク, 設備ID  
- equipment: Contains 設備名, 設備種別ID, 稼働状態, 重要度, 設備ID
- maintenance_history: Contains 実施日, コスト, 作業内容
- inspection_plan: Contains 検査日, 結果, 次回検査日

Match user requests to appropriate tables:
- "thickness" → thickness_measurement table
- "risk" or "リスク" → equipment_risk_assessment table  
- "cost" or "コスト" → maintenance_history table
- "inspection" or "検査" → inspection_plan table`
      userPrompt = `Data schema: ${JSON.stringify(schema || data)}
      
User request: "${prompt}"

Based on this request, return a JSON object specifying exactly what data you need:
{
  "tables": ["thickness_measurement", "equipment"],
  "fields": ["肉厚測定値(mm)", "検査日", "設備名"],
  "aggregations": ["thickness_time_series", "equipment_totals", "risk_matrix"],
  "time_grouping": "monthly" or "daily" or null,
  "chart_type": "line" or "bar" or "pie" or "heatmap"
}

Available aggregations:
- thickness_time_series: Thickness measurements over time
- risk_matrix: Risk assessment matrix (影響度 vs 信頼性)
- monthly_costs: Monthly maintenance costs over time
- equipment_totals: Total maintenance per equipment
- anomaly_severity: Count of anomalies by severity level

Only request data that is necessary for the specific visualization.`
    } else if (type === 'insights') {
      systemPrompt = `You are an industrial equipment inspection expert. Analyze inspection results and provide insights about equipment condition, trends, and recommendations. Focus on identifying anomalies, trends, and maintenance recommendations.`
      userPrompt = `Analyze this inspection data: ${JSON.stringify(data)}, ${prompt}`
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 2000,
    })

    return NextResponse.json({
      result: completion.choices[0].message.content,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('ChatGPT API error:', error)
    
    // Provide more specific error messages
    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your API key configuration.' },
        { status: 500 }
      )
    }
    
    if (error?.response?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    if (error?.message?.includes('apiKey')) {
      return NextResponse.json(
        { error: 'OpenAI API key configuration error. Please check environment variables.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to process request: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}