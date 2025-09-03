import fs from 'fs'
import path from 'path'
import { CalendarEvent } from '@/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'calendar.json')

// Default sample events
const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'VGBF Styrelsemöte',
    description: 'Månadsvis styrelsemöte via Teams',
    date: '2025-09-15',
    time: '19:00',
    endTime: '21:00',
    type: 'meeting',
    organizer: 'VGBF Styrelse',
    contactEmail: 'VastraGotalandsBF@bagskytte.se',
    registrationRequired: false,
    status: 'upcoming',
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Västkusttävlingen',
    description: 'Årlig tävling i fält och terräng',
    date: '2025-09-20',
    endDate: '2025-09-22',
    time: '09:00',
    endTime: '16:00',
    location: 'Borås BS',
    type: 'competition',
    organizer: 'Borås BS',
    contactEmail: 'tavling@borasbagskytte.se',
    registrationRequired: true,
    registrationUrl: 'https://www.bagskytte.se',
    maxParticipants: 120,
    currentParticipants: 45,
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Nybörjarkurs',
    description: 'Grundkurs i bågskytte för nybörjare',
    date: '2025-09-25',
    time: '18:00',
    endTime: '20:00',
    location: 'BS Gothia',
    type: 'course',
    organizer: 'BS Gothia',
    contactEmail: 'info@bsgothia.se',
    registrationRequired: true,
    maxParticipants: 15,
    currentParticipants: 8,
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'VGBF Höstmiddag',
    description: 'Årlig höstmiddag för alla medlemmar',
    date: '2025-10-12',
    time: '18:00',
    endTime: '23:00',
    location: 'Hotell Örgryte, Göteborg',
    type: 'social',
    organizer: 'VGBF',
    contactEmail: 'VastraGotalandsBF@bagskytte.se',
    registrationRequired: true,
    maxParticipants: 100,
    currentParticipants: 32,
    status: 'upcoming',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultEvents, null, 2))
    console.log('Calendar file created with default events')
  }
}

export function getAllEvents(): CalendarEvent[] {
  try {
    ensureDataFile()
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error reading calendar file:', error)
    return defaultEvents
  }
}

export function getPublicEvents(): CalendarEvent[] {
  return getAllEvents().filter(event => event.isPublic)
}

export function getEventsByMonth(year: number, month: number): CalendarEvent[] {
  const events = getPublicEvents()
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getFullYear() === year && eventDate.getMonth() === month
  })
}

export function getUpcomingEvents(limit?: number): CalendarEvent[] {
  const now = new Date()
  const events = getPublicEvents()
    .filter(event => new Date(event.date) >= now && event.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return limit ? events.slice(0, limit) : events
}

export function getEventById(id: string): CalendarEvent | null {
  const events = getAllEvents()
  return events.find(event => event.id === id) || null
}

export function addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent {
  const events = getAllEvents()
  const newEvent: CalendarEvent = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  events.push(newEvent)
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2))
  return newEvent
}

export function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
  const events = getAllEvents()
  const eventIndex = events.findIndex(event => event.id === id)
  
  if (eventIndex === -1) {
    return null
  }
  
  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2))
  return events[eventIndex]
}

export function deleteEvent(id: string): boolean {
  const events = getAllEvents()
  const filteredEvents = events.filter(event => event.id !== id)
  
  if (filteredEvents.length === events.length) {
    return false // Event not found
  }
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(filteredEvents, null, 2))
  return true
}
