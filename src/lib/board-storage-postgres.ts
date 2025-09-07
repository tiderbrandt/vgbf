import { sql } from './database'
import { BoardMember, BoardData } from '@/types'

/**
 * PostgreSQL-based board members storage implementation
 */

function dbRowToBoardMember(row: any): BoardMember {
  return {
    id: row.id,
    title: row.position,
    name: row.name,
    club: row.club_id,
    email: row.email || undefined,
    phone: row.phone || undefined,
    description: row.bio || '',
    order: row.display_order,
    category: row.category,
    isActive: row.is_active !== false,
    addedDate: row.term_start,
    updatedAt: row.updated_at
  }
}

function boardMemberToDbRow(member: Partial<BoardMember>): any {
  return {
    position: member.title,
    name: member.name,
    club_id: member.club,
    email: member.email,
    phone: member.phone,
    bio: member.description,
    display_order: member.order,
    category: member.category,
    is_active: member.isActive,
    term_start: member.addedDate,
    updated_at: member.updatedAt
  }
}

/**
 * Get all board members
 */
export async function getAllBoardMembers(): Promise<BoardMember[]> {
  try {
    const result = await sql`SELECT * FROM board_members ORDER BY category, "display_order" ASC`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.map(dbRowToBoardMember)
  } catch (error) {
    console.error('Error getting all board members:', error)
    throw new Error('Failed to fetch board members')
  }
}

/**
 * Get all board data organized by category
 */
export async function getAllBoardData(): Promise<BoardData> {
  try {
    const allMembers = await getAllBoardMembers()
    
    return {
      boardMembers: allMembers.filter(m => m.category === 'board'),
      substitutes: allMembers.filter(m => m.category === 'substitute'),
      auditors: allMembers.filter(m => m.category === 'auditor'),
      nominationCommittee: allMembers.filter(m => m.category === 'nomination'),
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting all board data:', error)
    throw new Error('Failed to fetch board data')
  }
}

/**
 * Get board member by ID
 */
export async function getBoardMemberById(id: string): Promise<BoardMember | null> {
  try {
    const result = await sql`SELECT * FROM board_members WHERE id = ${id}`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = result.rows || result
    return rows.length > 0 ? dbRowToBoardMember(rows[0]) : null
  } catch (error) {
    console.error('Error getting board member by ID:', error)
    throw new Error('Failed to fetch board member')
  }
}

/**
 * Add a new board member
 */
export async function addBoardMember(memberData: Omit<BoardMember, 'id' | 'addedDate' | 'updatedAt'>): Promise<BoardMember> {
  try {
    const id = Date.now().toString()
    const now = new Date().toISOString()
    const dbData = boardMemberToDbRow({ ...memberData, id, addedDate: now, updatedAt: now })
    
    await sql`
      INSERT INTO board_members (
        id, title, name, club, email, phone, description, "display_order",
        category, is_active, added_date, updated_at
      ) VALUES (
        ${id}, ${dbData.title}, ${dbData.name}, ${dbData.club}, ${dbData.email},
        ${dbData.phone}, ${dbData.description}, ${dbData.display_order}, ${dbData.category},
        ${dbData.is_active}, ${dbData.added_date}, ${dbData.updated_at}
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
    const now = new Date().toISOString()
    const dbData = boardMemberToDbRow({ ...memberData, updatedAt: now })
    
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
    
    values.push(id) // Add id as the last parameter
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
 * Save complete board data (legacy compatibility)
 */
export async function saveBoardData(boardData: BoardData): Promise<BoardData> {
  try {
    // This is a complex operation that would replace all board data
    // For now, return the current data
    return await getAllBoardData()
  } catch (error) {
    console.error('Error saving board data:', error)
    throw new Error('Failed to save board data')
  }
}
