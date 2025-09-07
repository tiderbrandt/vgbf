import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllEvents, 
  getPublicEvents, 
  addEvent, 
  updateEvent, 
  deleteEvent 
} from '@/lib/calendar-storage-postgres'
import { CalendarEvent } from '@/types'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get('public') === 'true'
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    let events: CalendarEvent[]
    
    if (publicOnly) {
      events = await getPublicEvents()
    } else {
      events = await getAllEvents()
    }
    
    // Filter by year and month if provided
    if (year && month) {
      const yearNum = parseInt(year)
      const monthNum = parseInt(month) - 1 // JavaScript months are 0-indexed
      events = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.getFullYear() === yearNum && eventDate.getMonth() === monthNum
      })
    }
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/calendar called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('POST calendar auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const eventData = await request.json()
    
    console.log('Adding calendar event:', { title: eventData.title })
    
    // Basic validation
    if (!eventData.title || !eventData.date || !eventData.time) {
      return NextResponse.json(
        { error: 'Title, date, and time are required' }, 
        { status: 400 }
      )
    }
    
    const newEvent = addEvent(eventData)
    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/calendar called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('PUT calendar auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' }, 
        { status: 400 }
      )
    }
    
    const updates = await request.json()
    const updatedEvent = updateEvent(id, updates)
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE /api/calendar called')
  
  // Check authentication using both header and cookie
  if (!verifyAdminAuth(request)) {
    console.log('DELETE calendar auth failed')
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('Deleting calendar event with ID:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' }, 
        { status: 400 }
      )
    }
    
    const success = deleteEvent(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Event not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' }, 
      { status: 500 }
    )
  }
}
