import { NextRequest, NextResponse } from 'next/server'
import { getAllRecords } from '@/lib/records-storage-postgres'

export async function GET(request: NextRequest) {
  try {
    const records = await getAllRecords()
    
    return NextResponse.json({
      success: true,
      count: records.length,
      data: records
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