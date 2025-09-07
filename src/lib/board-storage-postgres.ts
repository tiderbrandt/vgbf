import { sql } from './database'

/**
 * PostgreSQL-based board members storage implementation
 */

interface BoardMember {
  id: string
  name: string
  position: string
  email?: string
  phone?: string
  bio?: string
  imageUrl?: string
  order?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

function dbRowToBoardMember(row: any): BoardMember {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    email: row.email || undefined,
    phone: row.phone || undefined,
    bio: row.bio || undefined,
    imageUrl: row.image_url || undefined,
    order: row.order_index || 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function boardMemberToDbRow(member: Partial<BoardMember>): any {
  return {
    name: member.name,
    position: member.position,
    email: member.email,
    phone: member.phone,
    bio: member.bio,
    image_url: member.imageUrl,
    order_index: member.order,
    is_active: member.isActive
  }
}

/**
 * Get all board members
 */
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  try {
    const rows = await sql`SELECT * FROM board_members WHERE is_active = true ORDER BY order_index ASC, name ASC`
    return rows.map(dbRowToBoardMember)
  } catch (error) {
    console.error('Error getting all board members:', error)
    throw new Error('Failed to fetch board members')
  }
}

/**
 * Get board member by ID
 */
export async function getBoardMemberById(id: string): Promise<BoardMember | null> {
  try {
    const rows = await sql`SELECT * FROM board_members WHERE id = ${id}`
    return rows.length > 0 ? dbRowToBoardMember(rows[0]) : null
  } catch (error) {
    console.error('Error getting board member by ID:', error)
    throw new Error('Failed to fetch board member')
  }
}

/**
 * Add a new board member
 */
export async function addBoardMember(memberData: Omit<BoardMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<BoardMember> {
  try {
    const id = Date.now().toString()
    const dbData = boardMemberToDbRow({ ...memberData, id })
    
    await sql`
      INSERT INTO board_members (
        id, name, position, email, phone, bio, image_url, order_index, is_active
      ) VALUES (
        ${id}, ${dbData.name}, ${dbData.position}, ${dbData.email}, ${dbData.phone},
        ${dbData.bio}, ${dbData.image_url}, ${dbData.order_index}, ${dbData.is_active}
      )
    `
    
    const newMember = await getBoardMemberById(id)
    if (!newMember) throw new Error('Failed to retrieve newly created board member')
    return newMember
  } catch (error) {
    console.error('Error adding board member:', error)
    throw new Error('Failed to add board member')
  }
}

/**
 * Update an existing board member
 */
export async function updateBoardMember(id: string, memberData: Partial<BoardMember>): Promise<BoardMember | null> {
  try {
    const dbData = boardMemberToDbRow(memberData)
    
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
      return await getBoardMemberById(id)
    }
    
    values.push(id)
    const whereClause = `id = $${values.length}`
    
    const updateQuery = `UPDATE board_members SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
    await sql.query(updateQuery, values)
    
    return await getBoardMemberById(id)
  } catch (error) {
    console.error('Error updating board member:', error)
    throw new Error('Failed to update board member')
  }
}

/**
 * Delete a board member
 */
export async function deleteBoardMember(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM board_members WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting board member:', error)
    throw new Error('Failed to delete board member')
  }
}

/**
 * Reorder board members
 */
export async function reorderBoardMembers(orderedIds: string[]): Promise<boolean> {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await sql`UPDATE board_members SET order_index = ${i + 1} WHERE id = ${orderedIds[i]}`
    }
    return true
  } catch (error) {
    console.error('Error reordering board members:', error)
    throw new Error('Failed to reorder board members')
  }
}
