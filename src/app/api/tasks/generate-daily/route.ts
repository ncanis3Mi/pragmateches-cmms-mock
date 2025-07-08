// ============================================
// Daily Task Generation API Endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { TaskGenerationService } from '@/services/task-generation'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const taskService = new TaskGenerationService()
    const result = await taskService.generateDailyTasks()

    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    })

  } catch (error: any) {
    console.error('[API] Task generation error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Manual trigger endpoint for testing
    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('strategy_id')

    const taskService = new TaskGenerationService()
    
    if (strategyId) {
      // Generate task for specific strategy
      const result = await taskService.generateTaskForStrategy(strategyId)
      return NextResponse.json(result)
    } else {
      // Generate all daily tasks
      const result = await taskService.generateDailyTasks()
      return NextResponse.json(result)
    }

  } catch (error: any) {
    console.error('[API] Task generation error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}