import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCalendarEvents as getAllEvents, 
  getAllEventsForAdmin,
  getPublicEvents, 
  addCalendarEvent as addEvent, 
  updateCalendarEvent as updateEvent, 
  deleteCalendarEvent as deleteEvent 
} from '@/lib/calendar-storage-postgres'
import { CalendarEvent } from '@/types'
import { verifyAdminAuth } from '@/lib/auth'
import { withAuth } from '@/lib/api/withAuth'

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
      // Check if user is admin to get all events (including private)
      const isAdmin = verifyAdminAuth(request)
      if (isAdmin) {
        events = await getAllEventsForAdmin()
      } else {
        events = await getAllEvents()
      }
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

export const POST = withAuth(async (request: NextRequest) => {
  console.log('POST /api/calendar called')
  
  const eventData = await request.json()
  
  console.log('Adding calendar event:', { title: eventData.title })
  
  // Basic validation
  if (!eventData.title || !eventData.date || !eventData.time) {
    return NextResponse.json(
      { error: 'Title, date, and time are required' }, 
      { status: 400 }
    )
  }
  
  const newEvent = await addEvent(eventData)
  return NextResponse.json(newEvent, { status: 201 })
})

export const PUT = withAuth(async (request: NextRequest) => {
  console.log('PUT /api/calendar called')
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: 'Event ID is required' }, 
      { status: 400 }
    )
  }
  
  const updates = await request.json()
  const updatedEvent = await updateEvent(id, updates)
  
  if (!updatedEvent) {
    return NextResponse.json(
      { error: 'Event not found' }, 
      { status: 404 }
    )
  }
  
  return NextResponse.json(updatedEvent)
})

export const DELETE = withAuth(async (request: NextRequest) => {
  console.log('DELETE /api/calendar called')
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  console.log('Deleting calendar event with ID:', id)
  
  if (!id) {
    return NextResponse.json(
      { error: 'Event ID is required' }, 
      { status: 400 }
    )
  }
  
  const success = await deleteEvent(id)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Event not found' }, 
      { status: 404 }
    )
  }
  
  return NextResponse.json({ message: 'Event deleted successfully' })
})
