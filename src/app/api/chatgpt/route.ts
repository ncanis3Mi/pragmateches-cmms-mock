import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, data } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let systemPrompt = ''
    let userPrompt = prompt

    if (type === 'graph') {
      systemPrompt = `You are a data visualization expert. Generate chart configurations for inspection data in Chart.js format. Return ONLY valid JSON configurations wrapped in markdown code blocks (using \`\`\`json). Each chart should include type, data, and options properties. Use the actual data provided to create meaningful visualizations.`
      userPrompt = `Based on this inspection data: ${JSON.stringify(data)}, ${prompt}. Please analyze the data and create appropriate chart configurations.`
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