import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob-storage'
import { Club } from '@/types'

const clubsStorage = new BlobStorage<Club>('clubs.json')

// Import all clubs from local storage
async function getAllClubs(): Promise<Club[]> {
  try {
    // Read directly from the JSON file
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', 'clubs.json')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Could not read clubs from file:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Force reinitializing blob storage with all clubs...')
    
    // Get all clubs from local storage
    const allClubs = await getAllClubs()
    console.log(`Found ${allClubs.length} clubs in local storage`)
    
    if (allClubs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No clubs found in local storage'
      }, { status: 500 })
    }
    
    // Force write all clubs to blob storage 
    await clubsStorage.write(allClubs)
    console.log(`Force wrote ${allClubs.length} clubs to blob storage`)
    
    // Verify the write
    const verifyClubs = await clubsStorage.read()
    console.log(`Verified ${verifyClubs.length} clubs in blob storage`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully force reinitialized blob storage',
      writtenCount: allClubs.length,
      verifiedCount: verifyClubs.length,
      clubs: verifyClubs.map(c => ({ id: c.id, name: c.name }))
    })
    
  } catch (error) {
    console.error('Force reinitialize error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to force reinitialize clubs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
