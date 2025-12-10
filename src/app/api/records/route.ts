import { NextRequest, NextResponse } from 'next/server'
import { getAllRecords as getDistrictRecords, addRecord, deleteRecord } from '@/lib/records-storage-postgres'
import { withAuth } from '@/lib/api/withAuth'

// Force this route to be dynamic for admin operations
export const dynamic = 'force-dynamic'

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

export const POST = withAuth(async (request: NextRequest) => {
  console.log('POST /api/records called')
  
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
})

export const DELETE = withAuth(async (request: NextRequest) => {
  console.log('DELETE /api/records called')
  
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
})
