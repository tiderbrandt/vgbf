import { NextRequest, NextResponse } from 'next/server'
import { getRecordById, updateRecord, deleteRecord } from '@/lib/records-storage-postgres'
import { withAuth } from '@/lib/api/withAuth'

interface RouteParams {
  params: {
    id: string
  }
}

export const GET = withAuth(async (request: NextRequest, { params }: RouteParams) => {
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
})

export const PUT = withAuth(async (request: NextRequest, { params }: RouteParams) => {
  console.log('PUT /api/records/[id] called for ID:', params.id)
  
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
})

export const DELETE = withAuth(async (request: NextRequest, { params }: RouteParams) => {
  console.log('DELETE /api/records/[id] called for ID:', params.id)
  
  await deleteRecord(params.id)
  
  console.log('Record deleted successfully:', params.id)
  
  return NextResponse.json({
    success: true,
    message: 'Record deleted successfully'
  })
})