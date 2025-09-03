import { NextRequest, NextResponse } from 'next/server'
import { getDistrictRecords, addRecord, deleteRecord } from '@/lib/records-storage'

export async function GET() {
  try {
    const records = await getDistrictRecords()
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const required = ['category', 'class', 'name', 'club', 'score', 'date', 'competition', 'organizer']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} is required` },
          { status: 400 }
        )
      }
    }

    const newRecord = await addRecord(body)
    return NextResponse.json({ success: true, data: newRecord })
  } catch (error) {
    console.error('Error adding record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add record' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteRecord(body.id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}
