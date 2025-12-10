import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'

type HandlerFunction<T extends any[]> = (request: NextRequest, ...args: T) => Promise<NextResponse | Response>

/**
 * Middleware to protect API routes with admin authentication.
 * 
 * Usage:
 * export const POST = withAuth(async (request) => {
 *   // Your authenticated handler code
 * })
 */
export function withAuth<T extends any[]>(handler: HandlerFunction<T>) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse | Response> => {
    const isAuthenticated = verifyAdminAuth(request)
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
