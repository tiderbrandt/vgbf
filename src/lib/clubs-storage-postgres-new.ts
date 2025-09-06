import { sql } from './database'
import { Club } from    membershipFee: club.membershipFee,
    welcomes_new_members: club.welcomesNewMembers !== false,
    image_url: club.imageUrl,
    facebook: club.facebook,
    instagram: club.instagram
  }pes'

/**
 * PostgreSQL-based clubs storage implementation using Neon serverless driver
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
    activities: JSON.stringify(club.activities || []),
    facilities: JSON.stringify(club.facilities || []),
    training_times: JSON.stringify(club.trainingTimes || []),
    member_count: club.memberCount || 0,
    membership_fee: club.membershipFee,
    welcomes_new_members: club.welcomesNewMembers !== false,
    image_url: club.imageUrl,
    facebook: club.facebook,
    instagram: club.instagram,
    coordinates: club.coordinates ? JSON.stringify(club.coordinates) : null
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
  
  return result.map(dbRowToClub)
}

/**
 * Get club by ID
 */
export async function getClubById(id: string): Promise<Club | undefined> {
  const result = await sql`
    SELECT * FROM clubs 
    WHERE id = ${id}
  `
  
  return result.length > 0 ? dbRowToClub(result[0]) : undefined
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
      facebook, instagram, image_url, coordinates
    ) VALUES (
      ${dbRow.name}, ${dbRow.description}, ${dbRow.location}, ${dbRow.contact_person},
      ${dbRow.email}, ${dbRow.phone}, ${dbRow.website}, ${dbRow.address}, 
      ${dbRow.postal_code}, ${dbRow.city}, ${dbRow.established}, ${dbRow.activities}, 
      ${dbRow.facilities}, ${dbRow.training_times}, ${dbRow.member_count}, 
      ${dbRow.membership_fee}, ${dbRow.welcomes_new_members}, ${dbRow.facebook}, 
      ${dbRow.instagram}, ${dbRow.image_url}, ${dbRow.coordinates}
    ) RETURNING *
  `
  
  return dbRowToClub(result[0])
}

/**
 * Update an existing club
 */
export async function updateClub(id: string, clubData: Partial<Club>): Promise<Club | null> {
  const dbRow = clubToDbRow(clubData)
  
  // Build the SET clause dynamically
  const setClause = Object.entries(dbRow)
    .filter(([_, value]) => value !== undefined)
    .map(([key, _]) => `${key} = $${key}`)
    .join(', ')
  
  if (!setClause) {
    // No fields to update
    return getClubById(id) || null
  }
  
  const result = await sql`
    UPDATE clubs SET
      name = ${dbRow.name},
      description = ${dbRow.description},
      location = ${dbRow.location},
      contact_person = ${dbRow.contact_person},
      email = ${dbRow.email},
      phone = ${dbRow.phone},
      website = ${dbRow.website},
      address = ${dbRow.address},
      postal_code = ${dbRow.postal_code},
      city = ${dbRow.city},
      established = ${dbRow.established},
      activities = ${dbRow.activities},
      facilities = ${dbRow.facilities},
      training_times = ${dbRow.training_times},
      member_count = ${dbRow.member_count},
      membership_fee = ${dbRow.membership_fee},
      welcomes_new_members = ${dbRow.welcomes_new_members},
      facebook = ${dbRow.facebook},
      instagram = ${dbRow.instagram},
      image_url = ${dbRow.image_url},
      coordinates = ${dbRow.coordinates},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  
  return result.length > 0 ? dbRowToClub(result[0]) : null
}

/**
 * Delete a club
 */
export async function deleteClub(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM clubs 
    WHERE id = ${id}
  `
  
  return result.length > 0
}

/**
 * Get clubs count
 */
export async function getClubsCount(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM clubs
  `
  
  return parseInt(result[0].count)
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
  
  return result.map(dbRowToClub)
}
