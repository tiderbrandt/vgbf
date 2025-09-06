import { NextRequest, NextResponse } from 'next/server'
import { getAllSponsors, addSponsor, updateSponsor, deleteSponsor } from '@/lib/sponsors-storage-unified'
import { Sponsor } from '@/types'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

// Helper function to generate sponsor ID (keeping for compatibility)
function generateSponsorId(): string {
  return Date.now().toString()
}

export async function GET() {
  try {
    const sponsors = await getAllSponsors()
    return NextResponse.json({ success: true, data: sponsors })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/sponsors called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('POST sponsors auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    const { name, description, website, logoUrl, logoAlt, priority, isActive } = body

    console.log('Adding sponsor:', { name })

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const sponsorData = {
      name,
      description: description || '',
      website: website || '',
      logoUrl: logoUrl || '',
      logoAlt: logoAlt || '',
      priority: priority || 99,
      isActive: isActive !== undefined ? isActive : true,
      addedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newSponsor = await addSponsor(sponsorData)
    return NextResponse.json({ success: true, data: newSponsor })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, website, logoUrl, logoAlt, priority, isActive } = body

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID and name are required' },
        { status: 400 }
      )
    }

    const updateData = {
      name,
      description: description || '',
      website: website || '',
      logoUrl: logoUrl || '',
      logoAlt: logoAlt || '',
      priority: priority || 99,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date().toISOString()
    }

    const updatedSponsor = await updateSponsor(id, updateData)
    
    if (!updatedSponsor) {
      return NextResponse.json(
        { success: false, error: 'Sponsor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: updatedSponsor })
  } catch (error) {
    console.error('Error updating sponsor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update sponsor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/sponsors called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('DELETE sponsors auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('Deleting sponsor with ID:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteSponsor(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Sponsor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Sponsor deleted successfully' })
  } catch (error) {
    console.error('Error deleting sponsor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete sponsor' },
      { status: 500 }
    )
  }
}
