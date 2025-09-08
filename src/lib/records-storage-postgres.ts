import { sql } from './database'
import { DistrictRecord } from '@/types'

/**
 * PostgreSQL-based records storage implementation
 */

function dbRowToRecord(row: any): DistrictRecord {
  return {
    id: row.id,
    category: row.category,
    class: row.class,
    name: row.archer_name,
    club: row.club_name || row.club_id || '', // Use club_name if available, fallback to club_id
    score: row.score,
    date: row.competition_date,
    competition: row.competition || '',
    competitionUrl: row.competition_url || undefined,
    organizer: row.organizer || '',
    notes: row.notes || undefined
  }
}

function recordToDbRow(record: Partial<DistrictRecord>): any {
  return {
    category: record.category,
    class: record.class,
    archer_name: record.name,
    // Don't update club_id since it's a UUID foreign key - skip it for now
    score: record.score,
    competition_date: record.date,
    competition: record.competition,
    competition_url: record.competitionUrl,
    organizer: record.organizer,
    notes: record.notes
  }
}

/**
 * Get all district records
 */
export async function getAllRecords(): Promise<DistrictRecord[]> {
  try {
    const result = await sql`SELECT * FROM district_records ORDER BY category, class, score DESC`
    // Handle both Neon (returns array directly) and pg Pool (returns {rows: []})
    const rows = Array.isArray(result) ? result : result.rows
    console.log('Records query result:', { isArray: Array.isArray(result), hasRows: !!result?.rows, length: rows?.length })
    return rows.map(dbRowToRecord)
  } catch (error) {
    console.error('Error getting all records:', error)
    throw new Error('Failed to fetch records')
  }
}

/**
 * Get record by ID
 */
export async function getRecordById(id: string): Promise<DistrictRecord | null> {
  try {
    const result = await sql`SELECT * FROM district_records WHERE id = ${id}`
    // Handle both Neon (returns array directly) and pg Pool (returns {rows: []})
    const rows = Array.isArray(result) ? result : result.rows
    return rows.length > 0 ? dbRowToRecord(rows[0]) : null
  } catch (error) {
    console.error('Error getting record by ID:', error)
    throw new Error('Failed to fetch record')
  }
}

/**
 * Get records by category
 */
export async function getRecordsByCategory(category: string): Promise<DistrictRecord[]> {
  try {
    const result = await sql`SELECT * FROM district_records WHERE category = ${category} ORDER BY class, score DESC`
    // Handle both Neon (returns array directly) and pg Pool (returns {rows: []})
    const rows = Array.isArray(result) ? result : result.rows
    return rows.map(dbRowToRecord)
  } catch (error) {
    console.error('Error getting records by category:', error)
    throw new Error('Failed to fetch records by category')
  }
}

/**
 * Add a new record
 */
export async function addRecord(recordData: Omit<DistrictRecord, 'id'>): Promise<DistrictRecord> {
  try {
    // Generate a proper UUID using PostgreSQL's uuid_generate_v4()
    const result = await sql`SELECT uuid_generate_v4() as id`
    const id = result[0]?.id || crypto.randomUUID()
    
    const dbData = recordToDbRow({ ...recordData, id })
    
    // Exclude club_id since it's a foreign key - we'll handle club associations separately
    await sql`
      INSERT INTO district_records (
        id, category, class, archer_name, score, competition_date, competition, competition_url, organizer, notes
      ) VALUES (
        ${id}, ${dbData.category}, ${dbData.class}, ${dbData.archer_name},
        ${dbData.score}, ${dbData.competition_date}, ${dbData.competition}, ${dbData.competition_url},
        ${dbData.organizer}, ${dbData.notes}
      )
    `
    
    const newRecord = await getRecordById(id)
    if (!newRecord) throw new Error('Failed to retrieve newly created record')
    return newRecord
  } catch (error) {
    console.error('Error adding record:', error)
    throw new Error('Failed to add record')
  }
}

/**
 * Update an existing record
 */
export async function updateRecord(id: string, recordData: Partial<DistrictRecord>): Promise<DistrictRecord | null> {
  try {
    console.log('Updating record:', id, recordData)
    const dbData = recordToDbRow(recordData)
    console.log('Mapped to DB data:', dbData)
    
    // Use the correct table name and column names (excluding club_id since it's a foreign key)
    await sql`
      UPDATE district_records SET
        category = ${dbData.category},
        class = ${dbData.class},
        archer_name = ${dbData.archer_name},
        score = ${dbData.score},
        competition_date = ${dbData.competition_date},
        competition = ${dbData.competition},
        competition_url = ${dbData.competition_url},
        organizer = ${dbData.organizer},
        notes = ${dbData.notes}
      WHERE id = ${id}
    `
    
    console.log('Record updated successfully')
    return await getRecordById(id)
  } catch (error) {
    console.error('Error updating record:', error)
    throw new Error('Failed to update record')
  }
}

/**
 * Delete a record
 */
export async function deleteRecord(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM district_records WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting record:', error)
    throw new Error('Failed to delete record')
  }
}

/**
 * Search records by name, club, or competition
 */
export async function searchRecords(query: string): Promise<DistrictRecord[]> {
  try {
    const searchTerm = `%${query}%`
    const rows = await sql`
      SELECT * FROM district_records 
      WHERE name ILIKE ${searchTerm} OR club ILIKE ${searchTerm} OR competition ILIKE ${searchTerm}
      ORDER BY category, class, score DESC
    `
    return rows.map(dbRowToRecord)
  } catch (error) {
    console.error('Error searching records:', error)
    throw new Error('Failed to search records')
  }
}
