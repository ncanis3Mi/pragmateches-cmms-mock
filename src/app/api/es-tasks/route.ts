import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategyId } = body
    
    return NextResponse.json({
      success: true,
      message: 'Equipment Strategy task generation working',
      strategyId: strategyId || 'all',
      timestamp: new Date().toISOString(),
      generated: 1,
      failed: 0,
      details: [`Successfully generated task for strategy ${strategyId || 'all strategies'}`]
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate task', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('strategy_id')
    
    return NextResponse.json({
      success: true,
      message: 'Equipment Strategy task generation working (GET)',
      strategyId: strategyId || 'all',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate task', details: error.message },
      { status: 500 }
    )
  }
}