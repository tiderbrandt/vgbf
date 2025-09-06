import { query, transaction } from './database'
import { Club } from '@/types'

/**
 * PostgreSQL-based clubs storage implementation
 * Replaces the problematic Vercel Blob storage
 */

// Helper function to convert database row to Club object
function dbRowToClub(row: any): Club {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    location: row.location || '',
    contactPerson: row.contact_person || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    address: row.address || '',
    postalCode: row.postal_code || '',
    city: row.city || '',
    established: row.established || '',
    activities: row.activities || [],
    facilities: row.facilities || [],
    trainingTimes: row.training_times || [],
    memberCount: row.member_count || 0,
    membershipFee: row.membership_fee || '',
    welcomesNewMembers: row.welcomes_new_members || true,
    imageUrl: row.image_url || '',
    facebook: row.facebook || '',
    instagram: row.instagram || ''
  }
}

// Helper function to convert Club object to database row
function clubToDbRow(club: Partial<Club>) {
  return {
    name: club.name,
    description: club.description,
    location: club.location,
    contact_person: club.contactPerson,
    email: club.email,
    phone: club.phone,
    website: club.website,
    address: club.address,
    postal_code: club.postalCode,
    city: club.city,
    established: club.established,
    activities: club.activities,
    facilities: club.facilities,
    training_times: club.trainingTimes,
    member_count: club.memberCount,
    membership_fee: club.membershipFee,
    welcomes_new_members: club.welcomesNewMembers,
    facebook: club.facebook,
    instagram: club.instagram,
    image_url: club.imageUrl
  }
}

/**
 * Get all clubs
 */
export async function getAllClubs(): Promise<Club[]> {
  const result = await query(`
    SELECT * FROM clubs 
    ORDER BY name ASC
  `)
  
  return result.rows.map(dbRowToClub)
}

/**
 * Get club by ID
 */
export async function getClubById(id: string): Promise<Club | undefined> {
  const result = await query(`
    SELECT * FROM clubs 
    WHERE id = $1
  `, [id])
  
  if (result.rows.length === 0) {
    return undefined
  }
  
  return dbRowToClub(result.rows[0])
}

/**
 * Add a new club
 */
export async function addClub(clubData: Omit<Club, 'id'>): Promise<Club> {
  const dbRow = clubToDbRow(clubData)
  
  const result = await query(`
    INSERT INTO clubs (
      name, description, location, contact_person, email, phone, website,
      address, postal_code, city, established, activities, facilities,
      training_times, member_count, membership_fee, welcomes_new_members,
      facebook, instagram, image_url
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    ) RETURNING *
  `, [
    dbRow.name, dbRow.description, dbRow.location, dbRow.contact_person,
    dbRow.email, dbRow.phone, dbRow.website, dbRow.address, dbRow.postal_code,
    dbRow.city, dbRow.established, dbRow.activities, dbRow.facilities,
    dbRow.training_times, dbRow.member_count, dbRow.membership_fee,
    dbRow.welcomes_new_members, dbRow.facebook, dbRow.instagram, dbRow.image_url
  ])
  
  return dbRowToClub(result.rows[0])
}

/**
 * Update an existing club
 */
export async function updateClub(id: string, clubData: Partial<Club>): Promise<Club | null> {
  const dbRow = clubToDbRow(clubData)
  
  // Build dynamic UPDATE query based on provided fields
  const updateFields = []
  const values = []
  let paramCount = 1
  
  for (const [key, value] of Object.entries(dbRow)) {
    if (value !== undefined) {
      updateFields.push(`${key} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  }
  
  if (updateFields.length === 0) {
    // No fields to update, return existing club
    return await getClubById(id) || null
  }
  
  values.push(id) // Add ID as the last parameter
  
  const result = await query(`
    UPDATE clubs 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values)
  
  if (result.rows.length === 0) {
    return null
  }
  
  return dbRowToClub(result.rows[0])
}

/**
 * Delete a club
 */
export async function deleteClub(id: string): Promise<boolean> {
  const result = await query(`
    DELETE FROM clubs 
    WHERE id = $1
  `, [id])
  
  return result.rowCount! > 0
}

/**
 * Get clubs by location/city
 */
export async function getClubsByLocation(location: string): Promise<Club[]> {
  const result = await query(`
    SELECT * FROM clubs 
    WHERE LOWER(location) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)
    ORDER BY name ASC
  `, [`%${location}%`])
  
  return result.rows.map(dbRowToClub)
}

/**
 * Get clubs welcoming new members
 */
export async function getClubsWelcomingNewMembers(): Promise<Club[]> {
  const result = await query(`
    SELECT * FROM clubs 
    WHERE welcomes_new_members = true
    ORDER BY name ASC
  `)
  
  return result.rows.map(dbRowToClub)
}

/**
 * Search clubs by name, description, or activities
 */
export async function searchClubs(searchQuery: string): Promise<Club[]> {
  const result = await query(`
    SELECT * FROM clubs 
    WHERE 
      LOWER(name) LIKE LOWER($1) OR 
      LOWER(description) LIKE LOWER($1) OR 
      EXISTS (
        SELECT 1 FROM unnest(activities) AS activity 
        WHERE LOWER(activity) LIKE LOWER($1)
      )
    ORDER BY name ASC
  `, [`%${searchQuery}%`])
  
  return result.rows.map(dbRowToClub)
}
