import { sql } from './database'
import { CalendarEvent } from '@/types'

/**
 * PostgreSQL-based calendar storage implementation
 */

/**
 * PostgreSQL-based calendar storage implementation
 */

function dbRowToCalendarEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.start_date,
    endDate: row.end_date || undefined,
    time: row.start_time || '',
    endTime: row.end_time || undefined,
    location: row.location || undefined,
    type: row.event_type || 'other',
    organizer: row.organizer || undefined,
    contactEmail: row.contact_email || undefined,
    registrationRequired: row.registration_required === true,
    registrationUrl: row.registration_url || undefined,
    maxParticipants: row.max_participants || undefined,
    currentParticipants: row.current_participants || undefined,
    status: row.status || 'upcoming',
    isPublic: row.is_public !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function calendarEventToDbRow(event: Partial<CalendarEvent>): any {
  return {
    title: event.title,
    description: event.description,
    start_date: event.date,
    end_date: event.endDate,
    start_time: event.time,
    end_time: event.endTime,
    location: event.location,
    event_type: event.type,
    organizer: event.organizer,
    contact_email: event.contactEmail,
    registration_required: event.registrationRequired,
    registration_url: event.registrationUrl,
    max_participants: event.maxParticipants,
    current_participants: event.currentParticipants,
    status: event.status,
    is_public: event.isPublic
  }
}

/**
 * Get all calendar events (public only)
 */
export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const result = await sql`SELECT * FROM calendar_events WHERE is_public = true ORDER BY start_date ASC`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToCalendarEvent)
  } catch (error) {
    console.error('Error getting all calendar events:', error)
    throw new Error('Failed to fetch calendar events')
  }
}

/**
 * Get all calendar events including private ones (for admin use)
 */
export async function getAllEventsForAdmin(): Promise<CalendarEvent[]> {
  try {
    const result = await sql`SELECT * FROM calendar_events ORDER BY start_date ASC`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToCalendarEvent)
  } catch (error) {
    console.error('Error getting all events for admin:', error)
    throw new Error('Failed to fetch all events')
  }
}

/**
 * Get upcoming calendar events
 */
export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  try {
    const result = await sql`
      SELECT * FROM calendar_events 
      WHERE start_date >= CURRENT_DATE AND is_public = true AND status = 'upcoming'
      ORDER BY start_date ASC
    `
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToCalendarEvent)
  } catch (error) {
    console.error('Error getting upcoming events:', error)
    throw new Error('Failed to fetch upcoming events')
  }
}

/**
 * Get public calendar events
 */
export async function getPublicEvents(): Promise<CalendarEvent[]> {
  try {
    const result = await sql`
      SELECT * FROM calendar_events 
      WHERE is_public = true
      ORDER BY start_date ASC
    `
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToCalendarEvent)
  } catch (error) {
    console.error('Error getting public events:', error)
    throw new Error('Failed to fetch public events')
  }
}

/**
 * Get calendar event by ID
 */
export async function getCalendarEventById(id: string): Promise<CalendarEvent | null> {
  try {
    const result = await sql`SELECT * FROM calendar_events WHERE id = ${id}`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.length > 0 ? dbRowToCalendarEvent(rows[0]) : null
  } catch (error) {
    console.error('Error getting calendar event by ID:', error)
    throw new Error('Failed to fetch calendar event')
  }
}

/**
 * Add a new calendar event
 */
export async function addCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  try {
    const id = Date.now().toString()
    const dbData = calendarEventToDbRow({ ...eventData, id })
    
    await sql`
      INSERT INTO calendar_events (
        id, title, description, date, end_date, time, end_time, location, type,
        organizer, contact_email, registration_required, registration_url,
        max_participants, current_participants, status, is_public
      ) VALUES (
        ${id}, ${dbData.title}, ${dbData.description}, ${dbData.date}, ${dbData.end_date},
        ${dbData.time}, ${dbData.end_time}, ${dbData.location}, ${dbData.type},
        ${dbData.organizer}, ${dbData.contact_email}, ${dbData.registration_required},
        ${dbData.registration_url}, ${dbData.max_participants}, ${dbData.current_participants},
        ${dbData.status}, ${dbData.is_public}
      )
    `
    
    const newEvent = await getCalendarEventById(id)
    if (!newEvent) throw new Error('Failed to retrieve newly created calendar event')
    return newEvent
  } catch (error) {
    console.error('Error adding calendar event:', error)
    throw new Error('Failed to add calendar event')
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  try {
    const dbData = calendarEventToDbRow(eventData)
    
    // Build dynamic update query
    const updateFields: string[] = []
    const values: any[] = []
    
    Object.entries(dbData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${values.length + 1}`)
        values.push(value)
      }
    })
    
    if (updateFields.length === 0) {
      return await getCalendarEventById(id)
    }
    
    values.push(id)
    const whereClause = `id = $${values.length}`
    
    const updateQuery = `UPDATE calendar_events SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
    await sql.query(updateQuery, values)
    
    return await getCalendarEventById(id)
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw new Error('Failed to update calendar event')
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM calendar_events WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw new Error('Failed to delete calendar event')
  }
}

/**
 * Search calendar events by title or description
 */
export async function searchCalendarEvents(query: string): Promise<CalendarEvent[]> {
  try {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM calendar_events 
      WHERE (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_public = true
      ORDER BY start_date ASC
    `
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToCalendarEvent)
  } catch (error) {
    console.error('Error searching calendar events:', error)
    throw new Error('Failed to search calendar events')
  }
}

// Aliases for API compatibility
export const getAllEvents = getAllCalendarEvents
export const addEvent = addCalendarEvent
export const updateEvent = updateCalendarEvent
export const deleteEvent = deleteCalendarEvent
