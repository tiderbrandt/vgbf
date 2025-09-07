import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllBoardData, 
  addBoardMember, 
  updateBoardMember, 
  deleteBoardMember,
  saveBoardData
} from '@/lib/board-storage-postgres'
import { BoardMember, BoardData } from '@/types'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    const boardData = await getAllBoardData()
    
    if (category) {
      // Return specific category
      switch (category) {
        case 'board':
          return NextResponse.json({ success: true, data: boardData.boardMembers })
        case 'substitute':
          return NextResponse.json({ success: true, data: boardData.substitutes })
        case 'auditor':
          return NextResponse.json({ success: true, data: boardData.auditors })
        case 'nomination':
          return NextResponse.json({ success: true, data: boardData.nominationCommittee })
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid category' },
            { status: 400 }
          )
      }
    }

    // Return all board data
    return NextResponse.json({ success: true, data: boardData })
  } catch (error) {
    console.error('Error fetching board data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch board data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/board called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('POST board auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    console.log('Adding board member:', { name: body.name, category: body.category })
    
    // Validate required fields
    const required = ['name', 'club', 'title', 'category', 'description']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate category
    const validCategories = ['board', 'substitute', 'auditor', 'nomination']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    const memberData = {
      title: body.title,
      name: body.name,
      club: body.club,
      email: body.email || '',
      phone: body.phone || '',
      description: body.description,
      order: body.order || 99,
      category: body.category,
      isActive: body.isActive !== undefined ? body.isActive : true
    }

    const newMember = await addBoardMember(memberData)
    console.log('Board member added successfully:', newMember.id)
    
    return NextResponse.json({ success: true, data: newMember })
  } catch (error) {
    console.error('Error adding board member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add board member' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/board called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('PUT board auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Board member ID is required for update' },
        { status: 400 }
      )
    }

    console.log('Updating board member:', body.id)

    const updatedMember = await updateBoardMember(body.id, body)
    
    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Board member not found' },
        { status: 404 }
      )
    }

    console.log('Board member updated successfully:', updatedMember.id)
    return NextResponse.json({ success: true, data: updatedMember })
  } catch (error) {
    console.error('Error updating board member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update board member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/board called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('DELETE board auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('Deleting board member with ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Board member ID is required for deletion' },
        { status: 400 }
      )
    }

    const deleted = await deleteBoardMember(id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Board member not found' },
        { status: 404 }
      )
    }

    console.log('Board member deleted successfully:', id)
    return NextResponse.json({ success: true, message: 'Board member deleted successfully' })
  } catch (error) {
    console.error('Error deleting board member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete board member' },
      { status: 500 }
    )
  }
}
