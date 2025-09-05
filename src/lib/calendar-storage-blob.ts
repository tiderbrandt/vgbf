import { CalendarEvent } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for calendar
const calendarStorage = new BlobStorage<CalendarEvent>('data/calendar.json')

// Default calendar events
const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Styrelsemöte',
    description: 'Månatligt styrelsemöte för VGBF',
    date: '2024-03-15',
    time: '19:00',
    endTime: '21:00',
    location: 'Göteborg',
    type: 'meeting',
    organizer: 'VGBF Styrelsen',
    contactEmail: 'styrelsen@vgbf.se',
    registrationRequired: false,
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Nybörjarkurs',
    description: 'Grundkurs i bågskytte för nybörjare',
    date: '2024-04-10',
    endDate: '2024-04-12',
    time: '18:00',
    endTime: '20:00',
    location: 'Borås',
    type: 'course',
    organizer: 'Borås BS',
    contactEmail: 'info@borasbs.se',
    registrationRequired: true,
    registrationUrl: 'https://borasbs.se/kurs',
    maxParticipants: 15,
    currentParticipants: 8,
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function getAllEvents(): Promise<CalendarEvent[]> {
  try {
    const events = await calendarStorage.read()
    return events.length > 0 ? events : defaultEvents
  } catch (error) {
    console.error('Error reading calendar events from blob storage:', error)
    return defaultEvents
  }
}

export async function getUpcomingEvents(limit?: number): Promise<CalendarEvent[]> {
  const events = await getAllEvents()
  const now = new Date()
  const upcoming = events
    .filter(event => new Date(event.date) >= now && event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return limit ? upcoming.slice(0, limit) : upcoming
}

export async function getEventsByType(type: CalendarEvent['type']): Promise<CalendarEvent[]> {
  const events = await getAllEvents()
  return events.filter(event => event.type === type)
}

export async function getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
  const events = await getAllEvents()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= start && eventDate <= end
  })
}

export async function getEventById(id: string): Promise<CalendarEvent | null> {
  const events = await getAllEvents()
  return events.find(event => event.id === id) || null
}

export async function addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  const events = await getAllEvents()
  const now = new Date().toISOString()
  const newEvent: CalendarEvent = {
    ...event,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now
  }
  
  events.push(newEvent)
  await calendarStorage.write(events)
  return newEvent
}

export async function updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  const events = await getAllEvents()
  const index = events.findIndex(event => event.id === id)
  
  if (index === -1) {
    return null
  }
  
  events[index] = { 
    ...events[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  await calendarStorage.write(events)
  return events[index]
}

export async function deleteEvent(id: string): Promise<boolean> {
  const events = await getAllEvents()
  const index = events.findIndex(event => event.id === id)
  
  if (index === -1) {
    return false
  }
  
  events.splice(index, 1)
  await calendarStorage.write(events)
  return true
}

export async function getPublicEvents(): Promise<CalendarEvent[]> {
  const events = await getAllEvents()
  return events.filter(event => event.isPublic)
}

export async function getEventsByOrganizer(organizer: string): Promise<CalendarEvent[]> {
  const events = await getAllEvents()
  return events.filter(event => 
    event.organizer?.toLowerCase().includes(organizer.toLowerCase())
  )
}
