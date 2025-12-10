import { NextRequest, NextResponse } from 'next/server'
import { getAllSponsors, addSponsor, updateSponsor, deleteSponsor } from '@/lib/sponsors-storage-postgres'
import { Sponsor } from '@/types'
import { verifyAdminAuth } from '@/lib/auth'
import { withAuth } from '@/lib/api/withAuth'

// Force this route to be dynamic for admin operations
export const dynamic = 'force-dynamic'

// Helper function to generate sponsor ID (keeping for compatibility)
function generateSponsorId(): string {
  return Date.now().toString()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    // For admin requests that want inactive sponsors, verify authentication
    if (includeInactive && !verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const sponsors = await getAllSponsors(includeInactive)
    return NextResponse.json({ success: true, data: sponsors })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(async (request: NextRequest) => {
  console.log('POST /api/sponsors called')
  
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
})

export const PUT = withAuth(async (request: NextRequest) => {
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
})

export const DELETE = withAuth(async (request: NextRequest) => {
  console.log('DELETE /api/sponsors called')
  
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
})
