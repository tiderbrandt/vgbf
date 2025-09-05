import { NextRequest, NextResponse } from 'next/server'
import { getAllSponsors, saveSponsor, deleteSponsor, generateSponsorId } from '@/lib/sponsors-storage-blob'
import { Sponsor } from '@/types'

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
  try {
    const body = await request.json()
    const { name, description, website, logoUrl, logoAlt, priority, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const sponsor: Sponsor = {
      id: generateSponsorId(),
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

    await saveSponsor(sponsor)
    return NextResponse.json({ success: true, data: sponsor })
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

    const sponsor: Sponsor = {
      id,
      name,
      description: description || '',
      website: website || '',
      logoUrl: logoUrl || '',
      logoAlt: logoAlt || '',
      priority: priority || 99,
      isActive: isActive !== undefined ? isActive : true,
      addedDate: body.addedDate || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await saveSponsor(sponsor)
    return NextResponse.json({ success: true, data: sponsor })
  } catch (error) {
    console.error('Error updating sponsor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update sponsor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

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
