// ============================================
// Cron job for daily task generation
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { TaskGenerationService } from '@/services/task-generation'

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting daily task generation')
    
    const taskService = new TaskGenerationService()
    const results = await taskService.generateDailyTasks()
    
    console.log('[Cron] Daily task generation completed:', results)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    })
  } catch (error: any) {
    console.error('[Cron] Daily task generation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}