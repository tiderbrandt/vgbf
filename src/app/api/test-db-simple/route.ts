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
    
    // Try to import pg
    console.log('🔍 Testing pg import...')
    const { Pool } = await import('pg')
    console.log('✅ pg imported successfully')
    
    // Try to create a pool
    console.log('🔍 Testing pool creation...')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
    console.log('✅ Pool created successfully')
    
    // Try to connect
    console.log('🔍 Testing database connection...')
    const client = await pool.connect()
    console.log('✅ Connected to database')
    
    // Try a simple query
    const result = await client.query('SELECT 1 as test')
    console.log('✅ Query executed successfully:', result.rows[0])
    
    client.release()
    await pool.end()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      envVars,
      testResult: result.rows[0]
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
