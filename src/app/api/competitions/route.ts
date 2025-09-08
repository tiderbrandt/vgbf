import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCompetitions, 
  getUpcomingCompetitions, 
  getPastCompetitions as getCompletedCompetitions, 
  getCompetitionsByCategory,
  addCompetition,
  updateCompetition,
  deleteCompetition
} from '@/lib/competitions-storage-postgres'
import { Competition } from '@/types'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const category = searchParams.get('category')

  try {
    let competitions
    
    switch (type) {
      case 'upcoming':
        competitions = await getUpcomingCompetitions()
        break
      case 'completed':
        competitions = await getCompletedCompetitions()
        break
      default:
        competitions = await getAllCompetitions()
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      competitions = competitions.filter(comp => comp.category === category)
    }

    return NextResponse.json({
      success: true,
      data: competitions,
      count: competitions.length
    })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch competitions' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/competitions called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('POST competitions auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    console.log('Adding competition:', { title: body.title })
    
    const competitionData: Omit<Competition, 'id'> = {
      title: body.title,
      description: body.description,
      date: body.date,
      organizer: body.organizer,
      location: body.location,
      status: body.status || 'upcoming',
      category: body.category,
      maxParticipants: body.maxParticipants,
      registrationUrl: body.registrationUrl,
      resultsUrl: body.resultsUrl,
      contactEmail: body.contactEmail,
      fee: body.fee,
      equipment: body.equipment || [],
      imageUrl: body.imageUrl || '',
      imageAlt: body.imageAlt || '',
      // Note: registrationDeadline and rules are not in schema, so excluded
      registrationDeadline: '', // Set to empty string for interface compatibility
      rules: undefined, // Set to undefined for interface compatibility
      endDate: body.endDate,
      currentParticipants: body.currentParticipants,
      isExternal: body.isExternal || false
    }

    const newCompetition = await addCompetition(competitionData)

    return NextResponse.json({
      success: true,
      data: newCompetition
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create competition' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/competitions called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('PUT competitions auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Competition ID is required for update' 
        }, 
        { status: 400 }
      )
    }

    const updatedCompetition = await updateCompetition(body.id, body)

    if (!updatedCompetition) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Competition not found' 
        }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedCompetition
    })
  } catch (error) {
    console.error('Error updating competition:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update competition' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/competitions called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('DELETE competitions auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('Deleting competition with ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Competition ID is required for deletion' 
        }, 
        { status: 400 }
      )
    }

    const deleted = await deleteCompetition(id)

    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Competition not found' 
        }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Competition deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting competition:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete competition' 
      }, 
      { status: 500 }
    )
  }
}
