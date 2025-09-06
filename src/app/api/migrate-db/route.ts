import { NextRequest, NextResponse } from 'next/server'
// Avoid importing the neon-based sql/query here to keep migration isolated
// and use pg Pool directly below.
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema using Neon serverless driver with robust splitting
    console.log('📊 Creating tables and indexes...')

    // Split statements by semicolon but keep function bodies intact
    const statements = schema
      .split(/;\s*(?=CREATE|ALTER|DROP|COMMENT|INSERT|CREATE EXTENSION|CREATE OR REPLACE|--)/i)
      .map(s => s.trim())
      .filter(s => s.length)

    console.log(`🔧 Executing ${statements.length} statements...`)

    // Use pg Pool for migrations to avoid Neon serverless template restrictions
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        try {
          console.log(`➡️ Executing statement ${i + 1}/${statements.length}`)
          await pool.query(statement)
        } catch (e) {
          console.error(`❌ Statement ${i + 1} failed:`, e)
          throw e
        }
      }
    } finally {
      await pool.end()
    }
    
    console.log('✅ Database migration completed successfully!')
    
    // Test the connection
    console.log('🔍 Testing database connection...')
  // Use pg Pool to query the clubs count
  const pool2 = new Pool({ connectionString: process.env.DATABASE_URL })
  const countResult = await pool2.query('SELECT COUNT(*) as count FROM clubs')
  await pool2.end()
  console.log(`📈 Clubs table ready with ${countResult.rows[0].count} records`)
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
  clubsCount: countResult.rows[0].count
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
