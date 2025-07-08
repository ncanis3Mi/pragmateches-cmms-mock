// ============================================
// Automatic Task Generation Service
// ============================================

import { createClient } from '@supabase/supabase-js'

interface EquipmentStrategy {
  strategy_id: string
  equipment_id: string
  strategy_name: string
  strategy_type: string
  frequency_type: string
  frequency_value: number
  estimated_duration_hours: number
  required_skill_level?: string
  required_area?: string
  task_description: string
  safety_requirements?: string
  tools_required?: string
  parts_required?: string
  priority: string
}

interface StaffMember {
  staff_id: string
  name: string
  role: string
  area: string
  skills: {
    skill_type: string
    skill_level: string
    area: string
  }[]
}

export class TaskGenerationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Use service key for server-side operations
  )

  /**
   * Main function to generate daily tasks
   * Should be called by cron job or scheduled function
   */
  async generateDailyTasks(): Promise<{
    success: boolean
    generated: number
    failed: number
    details: string[]
  }> {
    console.log(`[TaskGeneration] Starting daily task generation at ${new Date().toISOString()}`)
    
    const results = {
      success: true,
      generated: 0,
      failed: 0,
      details: [] as string[]
    }

    try {
      // 1. Get all due strategies
      const dueStrategies = await this.getDueStrategies()
      console.log(`[TaskGeneration] Found ${dueStrategies.length} due strategies`)

      // 2. Generate tasks for each due strategy
      for (const strategy of dueStrategies) {
        try {
          const taskResult = await this.generateTaskFromStrategy(strategy)
          if (taskResult.success) {
            results.generated++
            results.details.push(`✅ Generated task for ${strategy.strategy_name} (${strategy.equipment_id})`)
          } else {
            results.failed++
            results.details.push(`❌ Failed to generate task for ${strategy.strategy_name}: ${taskResult.error}`)
          }
        } catch (error: any) {
          results.failed++
          results.details.push(`❌ Error generating task for ${strategy.strategy_name}: ${error.message}`)
        }
      }

      // 3. Log generation summary
      await this.logGenerationSummary(results)
      
    } catch (error: any) {
      results.success = false
      results.details.push(`❌ Critical error in task generation: ${error.message}`)
      console.error('[TaskGeneration] Critical error:', error)
    }

    console.log(`[TaskGeneration] Completed: ${results.generated} generated, ${results.failed} failed`)
    return results
  }

  /**
   * Get all equipment strategies that are due for task generation
   */
  private async getDueStrategies(): Promise<EquipmentStrategy[]> {
    const { data, error } = await this.supabase
      .from('equipment_strategy_schedule')
      .select('*')
      .in('status', ['DUE', 'UPCOMING'])
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to fetch due strategies: ${error.message}`)
    }

    return data || []
  }

  /**
   * Generate a work order task from an equipment strategy
   */
  private async generateTaskFromStrategy(strategy: EquipmentStrategy): Promise<{
    success: boolean
    workOrderId?: string
    error?: string
  }> {
    try {
      // 1. Find best staff member for this task
      const assignedStaff = await this.findBestStaffForTask(strategy)
      
      // 2. Generate work order ID
      const workOrderId = await this.generateWorkOrderId()
      
      // 3. Calculate due dates
      const scheduledDate = new Date()
      scheduledDate.setHours(8, 0, 0, 0) // Start at 8 AM
      
      const dueDate = new Date(scheduledDate)
      dueDate.setHours(scheduledDate.getHours() + Math.ceil(strategy.estimated_duration_hours))

      // 4. Create work order
      const { error: workOrderError } = await this.supabase
        .from('work_order')
        .insert({
          "作業指示ID": workOrderId,
          "設備ID": strategy.equipment_id,
          "作業種別ID": 1, // Assume 1 is maintenance work type
          "作業内容": strategy.task_description,
          "優先度": strategy.priority,
          "計画開始日時": scheduledDate.toISOString(),
          "計画終了日時": dueDate.toISOString(),
          "作業者ID": assignedStaff?.staff_id,
          "状態": 'SCHEDULED',
          "備考": `Auto-generated from strategy: ${strategy.strategy_name}\n\n` +
                 `Safety: ${strategy.safety_requirements || 'Standard safety protocols'}\n` +
                 `Tools: ${strategy.tools_required || 'Standard tools'}\n` +
                 `Parts: ${strategy.parts_required || 'None specified'}`
        })

      if (workOrderError) {
        throw new Error(`Failed to create work order: ${workOrderError.message}`)
      }

      // 5. Calculate next generation date
      const nextDate = await this.calculateNextGenerationDate(
        strategy.frequency_type,
        strategy.frequency_value,
        new Date()
      )

      // 6. Log the generation
      const { error: logError } = await this.supabase
        .from('task_generation_log')
        .insert({
          strategy_id: strategy.strategy_id,
          generated_date: new Date().toISOString().split('T')[0],
          next_generation_date: nextDate.toISOString().split('T')[0],
          work_order_id: workOrderId,
          status: 'GENERATED',
          assigned_staff_id: assignedStaff?.staff_id,
          generation_notes: `Auto-generated task assigned to ${assignedStaff?.name || 'Unassigned'}`
        })

      if (logError) {
        console.warn(`[TaskGeneration] Failed to log generation for ${strategy.strategy_id}:`, logError)
      }

      return { success: true, workOrderId }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Find the best staff member for a task based on skills, area, and availability
   */
  private async findBestStaffForTask(strategy: EquipmentStrategy): Promise<StaffMember | null> {
    // Get staff with required skills and area
    const { data: staffWithSkills, error } = await this.supabase
      .from('staff_master')
      .select(`
        "担当者ID",
        "氏名",
        "役職",
        "部署",
        staff_skills (
          skill_type,
          skill_level,
          area
        )
      `)
      .eq('staff_skills.is_available', true)

    if (error || !staffWithSkills) {
      console.warn('[TaskGeneration] Could not fetch staff data:', error)
      return null
    }

    // Score and rank staff members
    const scoredStaff = staffWithSkills.map(staff => {
      let score = 0
      
      // Area match (using 部署 as area)
      if (staff.部署 === strategy.required_area || 
          staff.staff_skills?.some((skill: any) => skill.area === strategy.required_area)) {
        score += 50
      }
      
      // Skill level match
      if (staff.staff_skills?.some((skill: any) => 
        skill.skill_level === strategy.required_skill_level)) {
        score += 30
      }
      
      // General skill availability
      if (staff.staff_skills?.length > 0) {
        score += 10
      }

      return {
        staff_id: staff.担当者ID,
        name: staff.氏名,
        role: staff.役職,
        area: staff.部署,
        skills: staff.staff_skills || [],
        score
      }
    })

    // Return highest scoring staff member
    const bestStaff = scoredStaff.sort((a, b) => b.score - a.score)[0]
    return bestStaff?.score > 0 ? bestStaff : null
  }

  /**
   * Generate unique work order ID
   */
  private async generateWorkOrderId(): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('generate_work_order_id')

    if (error) {
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-6)
      return `WO${timestamp}`
    }

    return data
  }

  /**
   * Calculate next generation date based on frequency
   */
  private async calculateNextGenerationDate(
    frequencyType: string,
    frequencyValue: number,
    baseDate: Date
  ): Promise<Date> {
    const nextDate = new Date(baseDate)
    
    switch (frequencyType) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + frequencyValue)
        break
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + (frequencyValue * 7))
        break
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + frequencyValue)
        break
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + (frequencyValue * 3))
        break
      case 'ANNUAL':
        nextDate.setFullYear(nextDate.getFullYear() + frequencyValue)
        break
      default:
        nextDate.setMonth(nextDate.getMonth() + 1) // Default to monthly
    }
    
    return nextDate
  }

  /**
   * Log generation summary for monitoring
   */
  private async logGenerationSummary(results: any): Promise<void> {
    console.log('[TaskGeneration] Generation Summary:', {
      timestamp: new Date().toISOString(),
      generated: results.generated,
      failed: results.failed,
      details: results.details
    })

    // You could also log to a monitoring table or external service here
  }

  /**
   * Manual trigger for specific strategy (for testing)
   */
  async generateTaskForStrategy(strategyId: string): Promise<{
    success: boolean
    workOrderId?: string
    error?: string
  }> {
    const { data: strategy, error } = await this.supabase
      .from('equipment_strategy')
      .select('*')
      .eq('strategy_id', strategyId)
      .single()

    if (error || !strategy) {
      return { success: false, error: 'Strategy not found' }
    }

    return await this.generateTaskFromStrategy(strategy)
  }
}