import { sql } from './database'
import { DistrictRecord } from '@/types'
import { randomUUID } from 'crypto'

/**
 * PostgreSQL-based records storage implementation
 */

function dbRowToRecord(row: any): DistrictRecord {
  return {
    id: row.id,
    category: row.category,
    class: row.class,
    name: row.archer_name,  // Database column is archer_name
    club: '', // TODO: Need to lookup club name from club_id, for now empty string
    score: row.score,
    date: row.competition_date, // Database column is competition_date
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
    archer_name: record.name,    // Map name to archer_name
    club: record.club,           // We'll handle club_id mapping later
    score: record.score,
    competition_date: record.date, // Map date to competition_date
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
    // Generate UUID for new record
    const newId = randomUUID()
    
    console.log('Adding record:', { category: recordData.category, name: recordData.name })
    
    await sql`
      INSERT INTO district_records (
        id, archer_name, club_id, category, class, score, competition, competition_date, competition_url, organizer, notes, verified
      ) VALUES (
        ${newId}, ${recordData.name}, ${null}, ${recordData.category}, 
        ${recordData.class}, ${recordData.score}, ${recordData.competition}, ${recordData.date},
        ${recordData.competitionUrl}, ${recordData.organizer}, ${recordData.notes}, ${false}
      )
    `
    
    const newRecord = await getRecordById(newId)
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
    
    // Build SET clauses for the fields we want to update
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (recordData.category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      values.push(recordData.category)
    }
    if (recordData.class !== undefined) {
      updates.push(`class = $${paramIndex++}`)
      values.push(recordData.class)
    }
    if (recordData.name !== undefined) {
      updates.push(`archer_name = $${paramIndex++}`)
      values.push(recordData.name)
    }
    if (recordData.club !== undefined) {
      // For now, we'll ignore club_id since we don't have club mapping
      // updates.push(`club_id = $${paramIndex++}`)
      // values.push(recordData.club)
    }
    if (recordData.score !== undefined) {
      updates.push(`score = $${paramIndex++}`)
      values.push(recordData.score)
    }
    if (recordData.date !== undefined) {
      updates.push(`competition_date = $${paramIndex++}`)
      values.push(recordData.date)
    }
    if (recordData.competition !== undefined) {
      updates.push(`competition = $${paramIndex++}`)
      values.push(recordData.competition)
    }
    if (recordData.competitionUrl !== undefined) {
      updates.push(`competition_url = $${paramIndex++}`)
      values.push(recordData.competitionUrl)
    }
    if (recordData.organizer !== undefined) {
      updates.push(`organizer = $${paramIndex++}`)
      values.push(recordData.organizer)
    }
    if (recordData.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`)
      values.push(recordData.notes)
    }
    
    if (updates.length === 0) {
      console.log('No fields to update')
      return await getRecordById(id)
    }
    
    // Add the ID for the WHERE clause
    values.push(id)
    const whereParam = `$${paramIndex}`
    
    const updateQuery = `UPDATE district_records SET ${updates.join(', ')} WHERE id = ${whereParam}`
    console.log('Update query:', updateQuery, 'Values:', values)
    
    await sql.query(updateQuery, values)
    
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
