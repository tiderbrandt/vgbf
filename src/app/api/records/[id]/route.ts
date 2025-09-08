import { NextRequest, NextResponse } from 'next/server'
import { getRecordById, updateRecord, deleteRecord } from '@/lib/records-storage-postgres'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication for individual record access
  if (!verifyAdminAuth(request)) {
    return createUnauthorizedResponse()
  }

  try {
    const record = await getRecordById(params.id)
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PUT /api/records/[id] called for ID:', params.id)
  
  // Check authentication
  if (!verifyAdminAuth(request)) {
    console.log('PUT record auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    console.log('Updating record:', { id: params.id, category: body.category, name: body.name })
    
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

    const updatedRecord = await updateRecord(params.id, body)
    if (!updatedRecord) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    console.log('Record updated successfully:', params.id)
    return NextResponse.json({ success: true, data: updatedRecord })
  } catch (error) {
    console.error('Error updating record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('DELETE /api/records/[id] called for ID:', params.id)
  
  // Check authentication
  if (!verifyAdminAuth(request)) {
    console.log('DELETE record auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const deleted = await deleteRecord(params.id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    console.log('Record deleted successfully:', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}
