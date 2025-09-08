import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET() {
  try {
    // Check if district_records table exists and get its structure
    const tableCheck = await sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'district_records'
      ORDER BY ordinal_position
    `
    
    // Get count of records
    const countResult = await sql`SELECT COUNT(*) as count FROM district_records`
    const count = Array.isArray(countResult) ? countResult[0]?.count : countResult.rows?.[0]?.count
    
    // Get sample records
    const sampleResult = await sql`SELECT * FROM district_records LIMIT 5`
    const samples = Array.isArray(sampleResult) ? sampleResult : (sampleResult.rows || [])
    
    // Get unique categories
    const categoriesResult = await sql`SELECT DISTINCT category FROM district_records ORDER BY category`
    const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult.rows || [])
    
    // Get unique classes  
    const classesResult = await sql`SELECT DISTINCT class FROM district_records ORDER BY class`
    const classes = Array.isArray(classesResult) ? classesResult : (classesResult.rows || [])

    return NextResponse.json({
      success: true,
      data: {
        tableExists: tableCheck.length > 0,
        tableSchema: tableCheck,
        recordCount: count,
        sampleRecords: samples,
        categories: categories.map((row: any) => row.category),
        classes: classes.map((row: any) => row.class)
      }
    })
  } catch (error) {
    console.error('Error checking records:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check records',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
