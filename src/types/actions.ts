export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
} 