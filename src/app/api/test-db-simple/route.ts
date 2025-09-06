import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Checking environment variables...')
    
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_starts_with: process.env.DATABASE_URL?.substring(0, 20) || 'not found',
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ADMIN_USERNAME: !!process.env.ADMIN_USERNAME
    }
    
    console.log('Environment check:', envVars)
    
    // Try to import Neon serverless driver
    console.log('🔍 Testing Neon serverless driver import...')
    const { neon } = await import('@neondatabase/serverless')
    console.log('✅ Neon serverless driver imported successfully')
    
    // Try to create a sql function
    console.log('🔍 Testing sql function creation...')
    const sql = neon(process.env.DATABASE_URL!)
    console.log('✅ SQL function created successfully')
    
    // Try a simple query
    console.log('🔍 Testing database query...')
    const result = await sql`SELECT 1 as test`
    console.log('✅ Query executed successfully:', result[0])
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      envVars,
      testResult: result[0]
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      envVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}
