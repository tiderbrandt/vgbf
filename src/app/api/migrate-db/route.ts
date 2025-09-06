import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema using Neon serverless driver
    console.log('📊 Creating tables and indexes...')
    await sql(schema as any)
    
    console.log('✅ Database migration completed successfully!')
    
    // Test the connection
    console.log('🔍 Testing database connection...')
    const result = await sql`SELECT COUNT(*) as count FROM clubs`
    console.log(`📈 Clubs table ready with ${result[0].count} records`)
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      clubsCount: result[0].count
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
