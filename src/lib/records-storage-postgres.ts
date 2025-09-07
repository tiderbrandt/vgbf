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
    name: row.name,
    club: row.club || '',
    score: row.score,
    date: row.date,
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
    name: record.name,
    club: record.club,
    score: record.score,
    date: record.date,
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
    const rows = await sql`SELECT * FROM records ORDER BY category, class, score DESC`
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
    const rows = await sql`SELECT * FROM records WHERE id = ${id}`
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
    const rows = await sql`SELECT * FROM records WHERE category = ${category} ORDER BY class, score DESC`
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
    const id = Date.now().toString()
    const dbData = recordToDbRow({ ...recordData, id })
    
    await sql`
      INSERT INTO records (
        id, category, class, name, club, score, date, competition, competition_url, organizer, notes
      ) VALUES (
        ${id}, ${dbData.category}, ${dbData.class}, ${dbData.name}, ${dbData.club},
        ${dbData.score}, ${dbData.date}, ${dbData.competition}, ${dbData.competition_url},
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
    const dbData = recordToDbRow(recordData)
    
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
      return await getRecordById(id)
    }
    
    values.push(id)
    const whereClause = `id = $${values.length}`
    
    const updateQuery = `UPDATE records SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
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
    await sql`DELETE FROM records WHERE id = ${id}`
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
      SELECT * FROM records 
      WHERE name ILIKE ${searchTerm} OR club ILIKE ${searchTerm} OR competition ILIKE ${searchTerm}
      ORDER BY category, class, score DESC
    `
    return rows.map(dbRowToRecord)
  } catch (error) {
    console.error('Error searching records:', error)
    throw new Error('Failed to search records')
  }
}
