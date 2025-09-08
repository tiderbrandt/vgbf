import { NextRequest, NextResponse } from 'next/server'
import { getAllRecords } from '@/lib/records-storage-postgres'
import { sql } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get raw database rows to check column names
    const rawResult = await sql`SELECT * FROM district_records LIMIT 1`
    const rows = Array.isArray(rawResult) ? rawResult : rawResult.rows
    
    const records = await getAllRecords()
    
    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
      rawSample: rows[0], // Show raw database structure
      rawColumns: rows[0] ? Object.keys(rows[0]) : []
    })
  } catch (error) {
    console.error('Debug records error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch records',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}