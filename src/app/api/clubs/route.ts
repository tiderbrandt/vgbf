import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllClubs, 
  addClub, 
  updateClub, 
  deleteClub, 
  getClubById,
  getClubsByLocation,
  getClubsWelcomingNewMembers,
  searchClubs
} from '@/lib/clubs-storage-postgres' // Switched to PostgreSQL
import { verifyAdminToken, verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

// PostgreSQL implementation - v1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const location = searchParams.get('location')
    const welcomingNew = searchParams.get('welcomingNew')

    if (id) {
      const club = await getClubById(id)
      if (!club) {
        return NextResponse.json(
          { success: false, error: 'Club not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, data: club })
    }

    let clubs = await getAllClubs()

    // Filter by location if specified
    if (location) {
      clubs = clubs.filter(club => 
        club.location.toLowerCase().includes(location.toLowerCase()) ||
        club.city.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Filter by clubs welcoming new members if specified
    if (welcomingNew === 'true') {
      clubs = clubs.filter(club => club.welcomesNewMembers)
    }

    // Sort clubs alphabetically by name
    clubs.sort((a, b) => a.name.localeCompare(b.name, 'sv'))

    return NextResponse.json({ success: true, data: clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'email', 'city', 'activities', 'welcomesNewMembers']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const newClub = await addClub(body)
    return NextResponse.json(
      { success: true, data: newClub },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create club' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    return createUnauthorizedResponse()
  }

  try {
    console.log('PUT /api/clubs - Starting update process')
    
    const body = await request.json()
    console.log('PUT /api/clubs - Request body parsed:', { id: body.id, hasUpdates: Object.keys(body).length })
    
    const { id, ...updates } = body

    if (!id) {
      console.log('PUT /api/clubs - Missing ID')
      return NextResponse.json(
        { success: false, error: 'Club ID is required' },
        { status: 400 }
      )
    }

    console.log('PUT /api/clubs - Calling updateClub with id:', id)
    let updatedClub
    try {
      updatedClub = await updateClub(id, updates)
      console.log('PUT /api/clubs - updateClub result:', !!updatedClub)
    } catch (e) {
      // Serialize error including non-enumerable properties
      const ser = (err: any) => {
        try { return JSON.stringify(err, Object.getOwnPropertyNames(err)) } catch (_) { return String(err) }
      }
      console.error('PUT /api/clubs - updateClub threw:', ser(e))
      throw e
    }
    
    if (!updatedClub) {
      console.log('PUT /api/clubs - Club not found')
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    console.log('PUT /api/clubs - Success, returning updated club')
    return NextResponse.json({ success: true, data: updatedClub })
  } catch (error) {
    const e: any = error
    const code = e?.code || e?.sourceError?.code
    let status = 500
    let userMessage = 'Failed to update club'
    if (code === '23505') { // unique_violation
      status = 409
      userMessage = 'A club with this unique field already exists'
    } else if (code === '23503') { // foreign_key_violation
      status = 400
      userMessage = 'Invalid reference (foreign key violation)'
    } else if (code === '22P02') { // invalid_text_representation
      status = 400
      userMessage = 'Invalid field format'
    } else if (code === '23502') { // not_null_violation
      status = 400
      userMessage = 'Missing required field'
    }

    console.error('PUT /api/clubs - Error updating club:', {
      code,
      message: e?.message,
      detail: e?.detail,
      hint: e?.hint,
      stack: e instanceof Error ? e.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: userMessage, code },
      { status }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Club ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteClub(id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Club deleted successfully' })
  } catch (error) {
    console.error('Error deleting club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete club' },
      { status: 500 }
    )
  }
}
