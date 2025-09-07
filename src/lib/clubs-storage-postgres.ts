import { sql } from './database'
import { Club } from '@/types'

/**
 * PostgreSQL-based clubs storage implementation using Neon serverless driver
 * Replaces the problematic Vercel Blob storage
 */

// Helper function to convert database row to Club object
function parseJsonArray(value: any) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim() === '') return []
  try {
    if (typeof value === 'string') return JSON.parse(value)
  } catch (_) {}
  return []
}

function dbRowToClub(row: any): Club {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    location: row.city || '', // Map city to location for backward compatibility
    contactPerson: row.contact_person || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    address: row.address || '',
    postalCode: row.postal_code || '',
    city: row.city || '',
    established: row.established_year ? row.established_year.toString() : '',
    activities: Array.isArray(row.activities) ? row.activities : [],
    facilities: Array.isArray(row.facilities) ? row.facilities : [],
    trainingTimes: Array.isArray(row.training_times) ? row.training_times : [],
    memberCount: row.member_count || 0,
    membershipFee: row.membership_fee || '',
    welcomesNewMembers: row.welcomes_new_members !== false,
    imageUrl: row.image_url || '',
    facebook: row.facebook_url || '',
    instagram: row.instagram_url || '',
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    isActive: row.is_active !== false,
    establishedYear: row.established_year,
    facebookUrl: row.facebook_url || '',
    instagramUrl: row.instagram_url || ''
  }
}

// Helper function to convert Club object to database row
function clubToDbRow(club: Partial<Club>): any {
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
    activities: Array.isArray(club.activities) ? club.activities : [], // PostgreSQL TEXT[]
    facilities: Array.isArray(club.facilities) ? club.facilities : [], // PostgreSQL TEXT[]
    training_times: JSON.stringify(club.trainingTimes || []), // JSONB
    member_count: club.memberCount || 0,
    membership_fee: club.membershipFee,
    welcomes_new_members: club.welcomesNewMembers !== false,
    image_url: club.imageUrl,
    facebook: club.facebook,
    instagram: club.instagram
  }
}

/**
 * Get all clubs
 */
export async function getAllClubs(): Promise<Club[]> {
  const result = await sql`
    SELECT * FROM clubs 
    ORDER BY name ASC
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.map(dbRowToClub)
}

/**
 * Get club by ID
 */
export async function getClubById(id: string): Promise<Club | undefined> {
  const result = await sql`
    SELECT * FROM clubs 
    WHERE id = ${id}
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.length > 0 ? dbRowToClub(rows[0]) : undefined
}

/**
 * Add a new club
 */
export async function addClub(clubData: Omit<Club, 'id'>): Promise<Club> {
  const dbRow = clubToDbRow(clubData)
  
  const result = await sql`
    INSERT INTO clubs (
      name, description, location, contact_person, email, phone, website,
      address, postal_code, city, established, activities, facilities,
      training_times, member_count, membership_fee, welcomes_new_members,
      facebook, instagram, image_url
    ) VALUES (
      ${dbRow.name}, ${dbRow.description}, ${dbRow.location}, ${dbRow.contact_person},
      ${dbRow.email}, ${dbRow.phone}, ${dbRow.website}, ${dbRow.address}, 
      ${dbRow.postal_code}, ${dbRow.city}, ${dbRow.established}, ${dbRow.activities}, 
      ${dbRow.facilities}, ${dbRow.training_times}, ${dbRow.member_count}, 
      ${dbRow.membership_fee}, ${dbRow.welcomes_new_members}, ${dbRow.facebook}, 
      ${dbRow.instagram}, ${dbRow.image_url}
    ) RETURNING *
  `
  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  if (rows.length === 0) throw new Error('Insert returned no rows')
  return dbRowToClub(rows[0])
}

/**
 * Update an existing club
 */
export async function updateClub(id: string, clubData: Partial<Club>): Promise<Club | null> {
  // Build dynamic SET clause only for provided fields to avoid overwriting with null/undefined
  const fieldMappings: Record<string, string> = {
    name: 'name',
    description: 'description',
    location: 'location',
    contactPerson: 'contact_person',
    email: 'email',
    phone: 'phone',
    website: 'website',
    address: 'address',
    postalCode: 'postal_code',
    city: 'city',
    established: 'established',
    activities: 'activities',
    facilities: 'facilities',
    trainingTimes: 'training_times',
    memberCount: 'member_count',
    membershipFee: 'membership_fee',
    welcomesNewMembers: 'welcomes_new_members',
    facebook: 'facebook',
    instagram: 'instagram',
    imageUrl: 'image_url'
  }

  const sets: string[] = []
  const values: any[] = []

  for (const [key, column] of Object.entries(fieldMappings)) {
    if (Object.prototype.hasOwnProperty.call(clubData, key)) {
      let value: any = (clubData as any)[key]
      if (key === 'activities' || key === 'facilities') {
        // PostgreSQL TEXT[] arrays need proper formatting
        if (Array.isArray(value)) {
          value = value.length > 0 ? value : [] // Keep as JS array for pg library
        } else {
          value = [] // Ensure it's an array
        }
      } else if (key === 'trainingTimes') {
        // training_times is JSONB, so stringify
        value = JSON.stringify(value || [])
      }
      if (key === 'welcomesNewMembers') {
        value = value !== false
      }
      sets.push(`${column} = $${sets.length + 1}`)
      values.push(value)
    }
  }

  if (sets.length === 0) {
    const existing = await getClubById(id)
    return existing || null // Nothing to update
  }

  // Always update updated_at
  sets.push(`updated_at = NOW()`) // no param for NOW()

  const updateSql = `UPDATE clubs SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`
  values.push(id)

  let result: any
  try {
    result = await sql.query(updateSql, values)
  } catch (error) {
    const e: any = error
    const pgMeta = {
      name: e?.name,
      message: e?.message,
      code: e?.code || e?.sourceError?.code,
      detail: e?.detail,
      hint: e?.hint,
      table: e?.table,
      column: e?.column,
      severity: e?.severity,
      query: updateSql
    }
    console.error('DB error in updateClub', pgMeta)
    throw error
  }

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.length > 0 ? dbRowToClub(rows[0]) : null
}

/**
 * Delete a club
 */
export async function deleteClub(id: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM clubs 
      WHERE id = ${id}
      RETURNING id
    `

    const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
    return rows.length > 0
  } catch (error) {
    console.error('DB error in deleteClub:', error && (error as any).message ? (error as any).message : String(error))
    throw error
  }
}

/**
 * Get clubs count
 */
export async function getClubsCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM clubs
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.length > 0 ? parseInt(rows[0].count) : 0
}

/**
 * Search clubs by name or location
 */
export async function searchClubs(searchTerm: string): Promise<Club[]> {
  const result = await sql`
    SELECT * FROM clubs 
    WHERE name ILIKE ${`%${searchTerm}%`} 
       OR location ILIKE ${`%${searchTerm}%`}
       OR city ILIKE ${`%${searchTerm}%`}
    ORDER BY name ASC
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.map(dbRowToClub)
}

/**
 * Get clubs by location
 */
export async function getClubsByLocation(location: string): Promise<Club[]> {
  const result = await sql`
    SELECT * FROM clubs 
    WHERE location ILIKE ${`%${location}%`}
       OR city ILIKE ${`%${location}%`}
    ORDER BY name ASC
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.map(dbRowToClub)
}

/**
 * Get clubs welcoming new members
 */
export async function getClubsWelcomingNewMembers(): Promise<Club[]> {
  const result = await sql`
    SELECT * FROM clubs 
    WHERE welcomes_new_members = true
    ORDER BY name ASC
  `

  const rows = (result && (result as any).rows) ? (result as any).rows : (Array.isArray(result) ? result : [])
  return rows.map(dbRowToClub)
}
