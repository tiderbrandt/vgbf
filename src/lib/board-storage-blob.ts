import { put, list, del } from '@vercel/blob'
import { BoardMember, BoardData } from '@/types'

const BLOB_PREFIX = 'board'

// Generate unique ID for board members
export function generateBoardMemberId(): string {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6)
}

// Get all board data
export async function getAllBoardData(): Promise<BoardData> {
  try {
    const blobs = await list({ prefix: BLOB_PREFIX })
    
    if (blobs.blobs.length === 0) {
      return getDefaultBoardData()
    }

    // Find the most recent board data file
    const boardBlob = blobs.blobs
      .filter(blob => blob.pathname.includes('board-data'))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

    if (!boardBlob) {
      return getDefaultBoardData()
    }

    const response = await fetch(boardBlob.url)
    const boardData: BoardData = await response.json()
    
    return boardData
  } catch (error) {
    console.error('Error fetching board data from blob storage:', error)
    return getDefaultBoardData()
  }
}

// Save board data
export async function saveBoardData(boardData: BoardData): Promise<BoardData> {
  try {
    const filename = `${BLOB_PREFIX}/board-data-${Date.now()}.json`
    
    const updatedData = {
      ...boardData,
      lastUpdated: new Date().toISOString()
    }

    const blob = await put(filename, JSON.stringify(updatedData, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    console.log('Board data saved to blob storage:', blob.url)
    return updatedData
  } catch (error) {
    console.error('Error saving board data to blob storage:', error)
    throw error
  }
}

// Add a board member
export async function addBoardMember(memberData: Omit<BoardMember, 'id' | 'addedDate' | 'updatedAt'>): Promise<BoardMember> {
  try {
    const boardData = await getAllBoardData()
    
    const newMember: BoardMember = {
      ...memberData,
      id: generateBoardMemberId(),
      addedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to appropriate category
    switch (newMember.category) {
      case 'board':
        boardData.boardMembers.push(newMember)
        break
      case 'substitute':
        boardData.substitutes.push(newMember)
        break
      case 'auditor':
        boardData.auditors.push(newMember)
        break
      case 'nomination':
        boardData.nominationCommittee.push(newMember)
        break
    }

    await saveBoardData(boardData)
    return newMember
  } catch (error) {
    console.error('Error adding board member:', error)
    throw error
  }
}

// Update a board member
export async function updateBoardMember(id: string, updates: Partial<BoardMember>): Promise<BoardMember | null> {
  try {
    const boardData = await getAllBoardData()
    
    // Find the member in all categories
    let memberFound = false
    let updatedMember: BoardMember | null = null

    const categories = ['boardMembers', 'substitutes', 'auditors', 'nominationCommittee'] as const
    
    for (const category of categories) {
      const memberIndex = boardData[category].findIndex(member => member.id === id)
      if (memberIndex !== -1) {
        boardData[category][memberIndex] = {
          ...boardData[category][memberIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        updatedMember = boardData[category][memberIndex]
        memberFound = true
        break
      }
    }

    if (!memberFound) {
      return null
    }

    await saveBoardData(boardData)
    return updatedMember
  } catch (error) {
    console.error('Error updating board member:', error)
    throw error
  }
}

// Delete a board member
export async function deleteBoardMember(id: string): Promise<boolean> {
  try {
    const boardData = await getAllBoardData()
    
    const categories = ['boardMembers', 'substitutes', 'auditors', 'nominationCommittee'] as const
    let memberFound = false

    for (const category of categories) {
      const memberIndex = boardData[category].findIndex(member => member.id === id)
      if (memberIndex !== -1) {
        boardData[category].splice(memberIndex, 1)
        memberFound = true
        break
      }
    }

    if (!memberFound) {
      return false
    }

    await saveBoardData(boardData)
    return true
  } catch (error) {
    console.error('Error deleting board member:', error)
    throw error
  }
}

// Get default board data (current hardcoded data)
function getDefaultBoardData(): BoardData {
  return {
    boardMembers: [
      {
        id: generateBoardMemberId(),
        title: 'Ordförande',
        name: 'Bengt Idéhn',
        club: 'BS Gothia',
        email: 'VastraGotalandsBF@bagskytte.se',
        phone: '0705 46 34 66',
        description: 'Ansvarar för förbundets strategiska riktning och representation.',
        order: 1,
        category: 'board',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Sekreterare',
        name: 'Peter Svahn',
        club: 'Vänersborg BK',
        description: 'Ansvarar för protokoll och kommunikation.',
        order: 2,
        category: 'board',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Kassör',
        name: 'Ann Hansson',
        club: 'Borås BS',
        description: 'Ansvarar för förbundets ekonomi och bokföring.',
        order: 3,
        category: 'board',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Ordinarie ledamot',
        name: 'Kristian Isaksson',
        club: 'Lindome BSK',
        description: 'Bidrar till styrelsearbetet inom olika ansvarsområden.',
        order: 4,
        category: 'board',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Ordinarie ledamot',
        name: 'Kenth Olofsson',
        club: 'Halmstad BF',
        description: 'Bidrar till styrelsearbetet inom olika ansvarsområden.',
        order: 5,
        category: 'board',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    substitutes: [
      {
        id: generateBoardMemberId(),
        title: 'Suppleant',
        name: 'Peter Bohman',
        club: 'Tibro BS',
        description: 'Suppleant i styrelsen.',
        order: 1,
        category: 'substitute',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Suppleant',
        name: 'Julia Christensen',
        club: 'Borås BS',
        description: 'Suppleant i styrelsen.',
        order: 2,
        category: 'substitute',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    auditors: [
      {
        id: generateBoardMemberId(),
        title: 'Revisor',
        name: 'Eijvor Carlsson',
        club: 'Borås BS',
        description: 'Revisor för förbundet.',
        order: 1,
        category: 'auditor',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Revisor',
        name: 'Bo Carlsson',
        club: 'Borås BS',
        description: 'Revisor för förbundet.',
        order: 2,
        category: 'auditor',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    nominationCommittee: [
      {
        id: generateBoardMemberId(),
        title: 'Ordförande för valberedningen',
        name: 'Ellinor Ryrå',
        club: 'BS Gothia',
        description: 'Ordförande för valberedningen.',
        order: 1,
        category: 'nomination',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: generateBoardMemberId(),
        title: 'Ledamot valberedning',
        name: 'Morgan Elf',
        club: 'Tibro BS',
        description: 'Ledamot i valberedningen.',
        order: 2,
        category: 'nomination',
        isActive: true,
        addedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    lastUpdated: new Date().toISOString(),
    meetingInfo: {
      description: 'Styrelsen för Västra Götalands Bågskytteförbund arbetar för att främja bågskyttet i regionen och stödja våra medlemsklubbar. Vi träffas regelbundet för att diskutera förbundets verksamhet, ekonomi och framtida utveckling.',
      contactInfo: 'Har du frågor eller förslag till styrelsen? Kontakta oss gärna via e-post eller telefon.'
    }
  }
}
