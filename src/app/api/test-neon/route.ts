import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing Neon connection step by step...')
    
    // Step 1: Check environment
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not found' }, { status: 500 })
    }
    
  // Use central database helper so fallbacks are respected
  console.log('Importing database helper...')
  const { sql } = await import('../../../lib/database')
  console.log('Database helper ready')

  console.log('Testing query...')
  const result = await sql`SELECT 1 as test`
  console.log('Query result:', result?.rows ?? result)
    
    return NextResponse.json({
      success: true,
      message: 'Neon connection successful',
      testResult: result[0]
    })
    
  } catch (error) {
    console.error('Neon test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
