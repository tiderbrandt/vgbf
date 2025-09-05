import { NextRequest, NextResponse } from 'next/server'
import { getAllClubs as getClubs, addClub, updateClub, deleteClub, getClubById } from '@/lib/clubs-storage-blob'
import { verifyAdminToken, verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

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

    let clubs = await getClubs()

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
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Club ID is required' },
        { status: 400 }
      )
    }

    const updatedClub = await updateClub(id, updates)
    
    if (!updatedClub) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updatedClub })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update club' },
      { status: 500 }
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
