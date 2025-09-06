import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllContactData, 
  saveContactData,
  updateMainContact,
  updatePostalAddress,
  updateOrganizationNumber,
  addQuickLink,
  updateQuickLink,
  deleteQuickLink,
  addFAQItem,
  updateFAQItem,
  deleteFAQItem
} from '@/lib/contact-storage-blob'
import { ContactData } from '@/types'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const contactData = await getAllContactData()
    return NextResponse.json({ success: true, data: contactData })
  } catch (error) {
    console.error('Error fetching contact data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/contact called')
  
  // Check authentication
  if (!verifyAdminAuth(request)) {
    console.log('PUT contact auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    const { type, data } = body

    let result: ContactData | null = null

    switch (type) {
      case 'mainContact':
        result = await updateMainContact(data)
        break
      case 'postalAddress':
        result = await updatePostalAddress(data)
        break
      case 'organizationNumber':
        result = await updateOrganizationNumber(data)
        break
      case 'quickLink':
        if (data.id) {
          result = await updateQuickLink(data.id, data)
        } else {
          result = await addQuickLink(data)
        }
        break
      case 'faqItem':
        if (data.id) {
          result = await updateFAQItem(data.id, data)
        } else {
          result = await addFAQItem(data)
        }
        break
      case 'fullUpdate':
        result = await saveContactData(data)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid update type' },
          { status: 400 }
        )
    }

    if (result === null) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    console.log('Contact data updated successfully')
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating contact data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/contact called')
  
  // Check authentication
  if (!verifyAdminAuth(request)) {
    console.log('DELETE contact auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    let result: ContactData | null = null

    switch (type) {
      case 'quickLink':
        result = await deleteQuickLink(id)
        break
      case 'faqItem':
        result = await deleteFAQItem(id)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid delete type' },
          { status: 400 }
        )
    }

    if (result === null) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    console.log('Contact item deleted successfully')
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error deleting contact item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact item' },
      { status: 500 }
    )
  }
}
