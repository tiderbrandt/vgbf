import { sql } from './database'
import { Competition } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * PostgreSQL-based competitions storage implementation
 */

// Helper function to convert database row to Competition object
function parseJsonArray(value: any) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim() === '') return []
  try {
    if (typeof value === 'string') return JSON.parse(value)
  } catch (_) {}
  return []
}

function dbRowToCompetition(row: any): Competition {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date: row.start_date,
    endDate: row.end_date || undefined,
    location: row.location || '',
    registrationDeadline: '', // Not in schema, set to empty string
    maxParticipants: row.max_participants || undefined,
    currentParticipants: row.current_participants || undefined,
    category: row.category || 'other',
    status: row.status || 'upcoming',
    organizer: row.organizer || '',
    contactEmail: row.contact_email || '',
    registrationUrl: row.registration_url || undefined,
    resultsUrl: row.results_url || undefined,
    imageUrl: row.image_url || undefined,
    imageAlt: row.image_alt || undefined,
    fee: row.entry_fee || undefined, // Note: Schema uses entry_fee
    equipment: parseJsonArray(row.equipment),
    rules: undefined, // Not in schema
    isExternal: row.is_external === true
  }
}

// Helper function to convert Competition object to database row
function competitionToDbRow(competition: Partial<Competition>): any {
  return {
    title: competition.title,
    description: competition.description,
    start_date: competition.date,
    end_date: competition.endDate,
    location: competition.location,
    max_participants: competition.maxParticipants,
    current_participants: competition.currentParticipants,
    category: competition.category,
    status: competition.status,
    organizer: competition.organizer,
    contact_email: competition.contactEmail,
    registration_url: competition.registrationUrl,
    results_url: competition.resultsUrl,
    image_url: competition.imageUrl,
    image_alt: competition.imageAlt,
    entry_fee: competition.fee, // Note: Schema uses entry_fee
    equipment: JSON.stringify(competition.equipment || []),
    is_external: competition.isExternal === true
    // Note: registration_deadline and rules are not in schema, so removed
  }
}

/**
 * Get all competitions
 */
export async function getAllCompetitions(): Promise<Competition[]> {
  try {
    const result = await sql`SELECT * FROM competitions ORDER BY start_date ASC`
    console.log('getAllCompetitions result:', { 
      hasResult: !!result, 
      hasRows: !!result?.rows, 
      rowCount: result?.rows?.length || 0 
    })
    
    if (!result || !result.rows) {
      console.warn('getAllCompetitions: result or rows is undefined, returning empty array')
      return []
    }
    
    return result.rows.map(dbRowToCompetition)
  } catch (error) {
    console.error('Error getting all competitions:', error)
    return [] // Return empty array instead of throwing during build
  }
}

/**
 * Get upcoming competitions
 */
export async function getUpcomingCompetitions(): Promise<Competition[]> {
  try {
    const result = await sql`
      SELECT * FROM competitions 
      WHERE start_date >= CURRENT_DATE AND status = 'upcoming'
      ORDER BY start_date ASC
    `
    console.log('getUpcomingCompetitions result:', { 
      hasResult: !!result, 
      hasRows: !!result?.rows, 
      rowCount: result?.rows?.length || 0 
    })
    
    if (!result || !result.rows) {
      console.warn('getUpcomingCompetitions: result or rows is undefined, returning empty array')
      return []
    }
    
    return result.rows.map(dbRowToCompetition)
  } catch (error) {
    console.error('Error getting upcoming competitions:', error)
    return [] // Return empty array instead of throwing during build
  }
}

/**
 * Get past/completed competitions
 */
export async function getPastCompetitions(): Promise<Competition[]> {
  try {
    const result = await sql`
      SELECT * FROM competitions 
      WHERE start_date < CURRENT_DATE OR status = 'completed'
      ORDER BY start_date DESC
    `
    console.log('getPastCompetitions result:', { 
      hasResult: !!result, 
      hasRows: !!result?.rows, 
      rowCount: result?.rows?.length || 0 
    })
    
    if (!result || !result.rows) {
      console.warn('getPastCompetitions: result or rows is undefined, returning empty array')
      return []
    }
    
    return result.rows.map(dbRowToCompetition)
  } catch (error) {
    console.error('Error getting past competitions:', error)
    return [] // Return empty array instead of throwing during build
  }
}

/**
 * Get competition by ID
 */
export async function getCompetitionById(id: string): Promise<Competition | null> {
  try {
    const result = await sql`SELECT * FROM competitions WHERE id = ${id}`
    console.log('getCompetitionById query result:', { 
      rows: result.rows.length,
      firstRow: result.rows.length > 0 ? Object.keys(result.rows[0]) : 'no rows'
    })
    return result.rows.length > 0 ? dbRowToCompetition(result.rows[0]) : null
  } catch (error) {
    console.error('Error getting competition by ID:', error)
    throw new Error('Failed to fetch competition')
  }
}

/**
 * Add a new competition
 */
export async function addCompetition(competitionData: Omit<Competition, 'id'>): Promise<Competition> {
  try {
    const id = uuidv4()
    const dbData = competitionToDbRow({ ...competitionData, id })
    
    console.log('Adding competition with data:', dbData)
    console.log('Generated UUID:', id)
    
    // Insert based on actual schema columns (without registration_deadline and rules as they don't exist)
    const insertResult = await sql`
      INSERT INTO competitions (
        id, title, description, start_date, end_date, location,
        max_participants, current_participants, category, status, organizer,
        contact_email, registration_url, results_url, image_url, image_alt,
        entry_fee, equipment, is_external
      ) VALUES (
        ${id}, ${dbData.title}, ${dbData.description}, ${dbData.start_date}, ${dbData.end_date},
        ${dbData.location}, ${dbData.max_participants}, ${dbData.current_participants}, 
        ${dbData.category}, ${dbData.status}, ${dbData.organizer}, ${dbData.contact_email},
        ${dbData.registration_url}, ${dbData.results_url}, ${dbData.image_url}, 
        ${dbData.image_alt}, ${dbData.entry_fee}, ${dbData.equipment}, ${dbData.is_external}
      )
    `
    console.log('Insert result:', insertResult)
    console.log('Looking for competition with ID:', id)
    
    const newCompetition = await getCompetitionById(id)
    if (!newCompetition) throw new Error('Failed to retrieve newly created competition')
    return newCompetition
  } catch (error) {
    console.error('Error adding competition:', error)
    throw new Error('Failed to add competition')
  }
}

/**
 * Update an existing competition
 */
export async function updateCompetition(id: string, competitionData: Partial<Competition>): Promise<Competition | null> {
  try {
    const dbData = competitionToDbRow(competitionData)
    
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
      return await getCompetitionById(id)
    }
    
    values.push(id) // Add id as the last parameter
    const whereClause = `id = $${values.length}`
    
    const updateQuery = `UPDATE competitions SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
    await sql.query(updateQuery, values)
    
    return await getCompetitionById(id)
  } catch (error) {
    console.error('Error updating competition:', error)
    throw new Error('Failed to update competition')
  }
}

/**
 * Delete a competition
 */
export async function deleteCompetition(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM competitions WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting competition:', error)
    throw new Error('Failed to delete competition')
  }
}

/**
 * Search competitions by title or description
 */
export async function searchCompetitions(query: string): Promise<Competition[]> {
  try {
    const searchTerm = `%${query}%`
    const rows = await sql`
      SELECT * FROM competitions 
      WHERE title ILIKE ${searchTerm} OR description ILIKE ${searchTerm}
      ORDER BY start_date ASC
    `
    return rows.map(dbRowToCompetition)
  } catch (error) {
    console.error('Error searching competitions:', error)
    throw new Error('Failed to search competitions')
  }
}

/**
 * Get competitions by category
 */
export async function getCompetitionsByCategory(category: string): Promise<Competition[]> {
  try {
    const rows = await sql`
      SELECT * FROM competitions 
      WHERE category = ${category}
      ORDER BY start_date ASC
    `
    return rows.map(dbRowToCompetition)
  } catch (error) {
    console.error('Error getting competitions by category:', error)
    throw new Error('Failed to fetch competitions by category')
  }
}
