import { sql } from './database'
import { Sponsor } from '@/types'
import crypto from 'crypto'

/**
 * PostgreSQL-based sponsors storage implementation
 */

function dbRowToSponsor(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    website: row.website_url || undefined, // Map from website_url
    logoUrl: row.logo_url || undefined,
    logoAlt: row.logo_alt || undefined,
    priority: row.priority || 0,
    isActive: row.is_active !== false,
    addedDate: row.created_at, // Map from created_at
    updatedAt: row.updated_at
  }
}

function sponsorToDbRow(sponsor: Partial<Sponsor>): any {
  return {
    name: sponsor.name,
    description: sponsor.description,
    website_url: sponsor.website, // Map to website_url
    logo_url: sponsor.logoUrl,
    logo_alt: sponsor.logoAlt,
    priority: sponsor.priority,
    is_active: sponsor.isActive,
    added_date: sponsor.addedDate
  }
}

/**
 * Get all sponsors (active only by default)
 */
export async function getAllSponsors(includeInactive: boolean = false): Promise<Sponsor[]> {
  try {
    const query = includeInactive 
      ? sql`SELECT * FROM sponsors ORDER BY is_active DESC, priority ASC, name ASC`
      : sql`SELECT * FROM sponsors WHERE is_active = true ORDER BY priority ASC, name ASC`
    
    const result = await query
    
    console.log('getAllSponsors result:', { 
      resultType: typeof result,
      isArray: Array.isArray(result),
      length: result?.length || 0,
      hasRows: !!result?.rows,
      includeInactive
    })

    // Handle both Neon format (direct array) and pg format (result.rows)
    let rows: any[]
    if (Array.isArray(result)) {
      rows = result
    } else if (result?.rows && Array.isArray(result.rows)) {
      rows = result.rows
    } else {
      console.warn('getAllSponsors: unexpected result format, returning empty array')
      return []
    }

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
    const result = await sql`SELECT * FROM sponsors WHERE id = ${id}`
    
    // Handle both Neon format (direct array) and pg format (result.rows)
    let rows: any[]
    if (Array.isArray(result)) {
      rows = result
    } else if (result?.rows && Array.isArray(result.rows)) {
      rows = result.rows
    } else {
      return null
    }
    
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
    const id = crypto.randomUUID() // Use proper UUID generation
    const dbData = sponsorToDbRow({ 
      ...sponsorData, 
      id,
      addedDate: new Date().toISOString() // Full ISO timestamp
    })
    
    await sql`
      INSERT INTO sponsors (
        id, name, description, website_url, logo_url, logo_alt, priority, is_active, created_at, updated_at
      ) VALUES (
        ${id}, ${dbData.name}, ${dbData.description}, ${dbData.website_url},
        ${dbData.logo_url}, ${dbData.logo_alt}, ${dbData.priority},
        ${dbData.is_active}, NOW(), NOW()
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
    const result = await sql`
      SELECT * FROM sponsors 
      WHERE (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_active = true
      ORDER BY priority ASC, name ASC
    `
    
    // Handle both Neon format (direct array) and pg format (result.rows)
    let rows: any[]
    if (Array.isArray(result)) {
      rows = result
    } else if (result?.rows && Array.isArray(result.rows)) {
      rows = result.rows
    } else {
      return []
    }
    
    return rows.map(dbRowToSponsor)
  } catch (error) {
    console.error('Error searching sponsors:', error)
    throw new Error('Failed to search sponsors')
  }
}
