import { NextRequest, NextResponse } from 'next/server'
import { getRecordById, updateRecord, deleteRecord } from '@/lib/records-storage-postgres'
import { verifyAdminAuth } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const isAuthorized = verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const record = await getRecordById(params.id)
    
    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: record
    })
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('PUT /api/records/[id] called for ID:', params.id)
    
    // Verify admin authentication
    const isAuthorized = verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Updating record:', { 
      id: params.id, 
      category: body.category, 
      name: body.name 
    })

    // Validate required fields
    if (!body.category || !body.class || !body.name || !body.score || !body.date || !body.competition || !body.organizer) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updatedRecord = await updateRecord(params.id, {
      category: body.category,
      class: body.class,
      name: body.name,
      club: body.club || '',
      score: body.score,
      date: body.date,
      competition: body.competition,
      competitionUrl: body.competitionUrl || '',
      organizer: body.organizer,
      notes: body.notes || ''
    })

    console.log('Record updated successfully:', params.id)
    
    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: 'Record updated successfully'
    })
  } catch (error) {
    console.error('Error updating record:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    console.log('DELETE /api/records/[id] called for ID:', params.id)
    
    // Verify admin authentication
    const isAuthorized = verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await deleteRecord(params.id)
    
    console.log('Record deleted successfully:', params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete record',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}