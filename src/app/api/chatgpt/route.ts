import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
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
      systemPrompt = `You are a data visualization expert. Generate chart configurations for inspection data in Chart.js v4 format. Return ONLY valid JSON configurations wrapped in markdown code blocks (using \`\`\`json). Each chart should include type, data, and options properties. Use the actual data provided to create meaningful visualizations.

IMPORTANT: Use Chart.js v4 syntax for scales:
- Use "scales": {"y": {"beginAtZero": true}} instead of "yAxes"
- Use "scales": {"x": {}} instead of "xAxes"  
- Use "plugins": {"title": {"display": true, "text": "Title"}} instead of "title" at root level`
      userPrompt = `Based on this inspection data: ${JSON.stringify(data)}, ${prompt}. Please analyze the data and create appropriate chart configurations using Chart.js v4 syntax.`
    } else if (type === 'data_requirements') {
      systemPrompt = `You are a data analysis expert. Given a data schema and user request, determine exactly what data fields and aggregations are needed. Return ONLY a JSON object with the required data specifications.`
      userPrompt = `Data schema: ${JSON.stringify(schema || data)}
      
User request: "${prompt}"

Based on this request, return a JSON object specifying exactly what data you need:
{
  "tables": ["table1", "table2"],
  "fields": ["field1", "field2"],
  "aggregations": ["monthly_costs", "equipment_totals", "anomaly_severity"],
  "time_grouping": "monthly" or "daily" or null,
  "chart_type": "bar" or "line" or "pie"
}

Available aggregations:
- monthly_costs: Monthly maintenance costs over time
- equipment_totals: Total maintenance per equipment
- anomaly_severity: Count of anomalies by severity level
- time_series: Time-based trending data

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
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      result: completion.choices[0].message.content,
      usage: completion.usage,
    })
  } catch (error) {
    console.error('ChatGPT API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}