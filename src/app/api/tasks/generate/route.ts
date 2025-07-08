// ============================================
// API Endpoint for Task Generation
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { TaskGenerationService } from '@/services/task-generation'

export async function POST(request: NextRequest) {
  try {
    const taskService = new TaskGenerationService()
    
    // Check if this is a manual trigger for specific strategy
    const body = await request.json().catch(() => ({}))
    
    if (body.strategyId) {
      // Manual generation for specific strategy
      const result = await taskService.generateTaskForStrategy(body.strategyId)
      
      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `Task generated successfully: ${result.workOrderId}`
          : `Failed to generate task: ${result.error}`,
        workOrderId: result.workOrderId
      })
    } else {
      // Daily generation for all due strategies
      const results = await taskService.generateDailyTasks()
      
      return NextResponse.json({
        success: results.success,
        message: `Task generation completed: ${results.generated} generated, ${results.failed} failed`,
        details: {
          generated: results.generated,
          failed: results.failed,
          summary: results.details
        }
      })
    }
  } catch (error: any) {
    console.error('Task generation API error:', error)
    
    return NextResponse.json({
      success: false,
      message: `Task generation failed: ${error.message}`
    }, { status: 500 })
  }
}

// GET endpoint to check generation status and upcoming tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const taskService = new TaskGenerationService()
    
    // This would require adding a method to get upcoming schedules
    // For now, return a simple status
    return NextResponse.json({
      success: true,
      message: `Upcoming task generation status for next ${days} days`,
      // You could add more detailed scheduling info here
    })
  } catch (error: any) {
    console.error('Task generation status API error:', error)
    
    return NextResponse.json({
      success: false,
      message: `Failed to get task generation status: ${error.message}`
    }, { status: 500 })
  }
}