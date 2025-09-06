import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing Neon connection step by step...')
    
    // Step 1: Check environment
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not found' }, { status: 500 })
    }
    
    // Step 2: Try importing Neon
    console.log('Importing Neon...')
    const { neon } = await import('@neondatabase/serverless')
    console.log('Neon imported successfully')
    
    // Step 3: Create sql function
    console.log('Creating sql function...')
    const sql = neon(dbUrl)
    console.log('SQL function created')
    
    // Step 4: Simple query
    console.log('Testing query...')
    const result = await sql`SELECT 1 as test`
    console.log('Query result:', result)
    
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
