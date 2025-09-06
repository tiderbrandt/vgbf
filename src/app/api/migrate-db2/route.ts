import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    const statements = schema
      .split(/;\s*(?=CREATE|ALTER|DROP|COMMENT|INSERT|CREATE EXTENSION|CREATE OR REPLACE|--)/i)
      .map(s => s.trim())
      .filter(s => s.length)

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    try {
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        await pool.query(statement)
      }
    } finally {
      await pool.end()
    }

    // Verify count
    const pool2 = new Pool({ connectionString: process.env.DATABASE_URL })
    const countRes = await pool2.query('SELECT COUNT(*) as count FROM clubs')
    await pool2.end()

    return NextResponse.json({ success: true, clubsCount: countRes.rows[0].count })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
