import { sql } from './database'
import { Sponsor } from '@/types'

/**
 * PostgreSQL-based sponsors storage implementation
 */

function dbRowToSponsor(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    website: row.website || undefined,
    logoUrl: row.logo_url || undefined,
    logoAlt: row.logo_alt || undefined,
    priority: row.priority || 0,
    isActive: row.is_active !== false,
    addedDate: row.added_date,
    updatedAt: row.updated_at
  }
}

function sponsorToDbRow(sponsor: Partial<Sponsor>): any {
  return {
    name: sponsor.name,
    description: sponsor.description,
    website: sponsor.website,
    logo_url: sponsor.logoUrl,
    logo_alt: sponsor.logoAlt,
    priority: sponsor.priority,
    is_active: sponsor.isActive,
    added_date: sponsor.addedDate
  }
}

/**
 * Get all sponsors
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  try {
    const rows = await sql`SELECT * FROM sponsors WHERE is_active = true ORDER BY priority ASC, name ASC`
    return rows.map(dbRowToSponsor)
  } catch (error) {
    console.error('Error getting all sponsors:', error)
    throw new Error('Failed to fetch sponsors')
  }
}

/**
 * Get sponsor by ID
 */
export async function getSponsorById(id: string): Promise<Sponsor | null> {
  try {
    const rows = await sql`SELECT * FROM sponsors WHERE id = ${id}`
    return rows.length > 0 ? dbRowToSponsor(rows[0]) : null
  } catch (error) {
    console.error('Error getting sponsor by ID:', error)
    throw new Error('Failed to fetch sponsor')
  }
}

/**
 * Add a new sponsor
 */
export async function addSponsor(sponsorData: Omit<Sponsor, 'id'>): Promise<Sponsor> {
  try {
    const id = Date.now().toString()
    const dbData = sponsorToDbRow({ 
      ...sponsorData, 
      id,
      addedDate: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    })
    
    await sql`
      INSERT INTO sponsors (
        id, name, description, website, logo_url, logo_alt, priority, is_active, added_date
      ) VALUES (
        ${id}, ${dbData.name}, ${dbData.description}, ${dbData.website},
        ${dbData.logo_url}, ${dbData.logo_alt}, ${dbData.priority},
        ${dbData.is_active}, ${dbData.added_date}
      )
    `
    
    const newSponsor = await getSponsorById(id)
    if (!newSponsor) throw new Error('Failed to retrieve newly created sponsor')
    return newSponsor
  } catch (error) {
    console.error('Error adding sponsor:', error)
    throw new Error('Failed to add sponsor')
  }
}

/**
 * Update an existing sponsor
 */
export async function updateSponsor(id: string, sponsorData: Partial<Sponsor>): Promise<Sponsor | null> {
  try {
    const dbData = sponsorToDbRow(sponsorData)
    
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
      return await getSponsorById(id)
    }
    
    values.push(id)
    const whereClause = `id = $${values.length}`
    
    const updateQuery = `UPDATE sponsors SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
    await sql.query(updateQuery, values)
    
    return await getSponsorById(id)
  } catch (error) {
    console.error('Error updating sponsor:', error)
    throw new Error('Failed to update sponsor')
  }
}

/**
 * Delete a sponsor
 */
export async function deleteSponsor(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM sponsors WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting sponsor:', error)
    throw new Error('Failed to delete sponsor')
  }
}

/**
 * Search sponsors by name or description
 */
export async function searchSponsors(query: string): Promise<Sponsor[]> {
  try {
    const searchTerm = `%${query}%`
    const rows = await sql`
      SELECT * FROM sponsors 
      WHERE (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_active = true
      ORDER BY priority ASC, name ASC
    `
    return rows.map(dbRowToSponsor)
  } catch (error) {
    console.error('Error searching sponsors:', error)
    throw new Error('Failed to search sponsors')
  }
}
