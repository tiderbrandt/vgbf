import { NextRequest, NextResponse } from 'next/server'
import { getAllRecords as getDistrictRecords, addRecord, deleteRecord } from '@/lib/records-storage-unified'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

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
  console.log('POST /api/records called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('POST records auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    console.log('Adding record:', { category: body.category, name: body.name })
    
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
    console.log('Record added successfully:', newRecord.id)
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
  console.log('DELETE /api/records called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('DELETE records auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    console.log('Deleting record with ID:', body.id)
    
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

    console.log('Record deleted successfully:', body.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}
