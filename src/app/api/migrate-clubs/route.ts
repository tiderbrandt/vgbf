import { NextRequest, NextResponse } from 'next/server'
import { getAllClubs } from '@/lib/clubs-storage-unified'
import { BlobStorage } from '@/lib/blob-storage'
import { Club } from '@/types'

const clubsStorage = new BlobStorage<Club>('clubs.json')

export async function POST(request: NextRequest) {
  try {
    console.log('Starting clubs migration...')
    
    // Get all clubs from local storage
    const localClubs = await getAllClubs()
    console.log(`Found ${localClubs.length} clubs in local storage`)
    
    // Check if blob storage already has clubs
    const existingClubs = await clubsStorage.read()
    console.log(`Found ${existingClubs.length} clubs in blob storage`)
    
    if (existingClubs.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Blob storage already has clubs. Migration not needed.',
        localCount: localClubs.length,
        blobCount: existingClubs.length
      })
    }
    
    // Copy all clubs to blob storage
    await clubsStorage.write(localClubs)
    console.log(`Migrated ${localClubs.length} clubs to blob storage`)
    
    // Verify the migration
    const migratedClubs = await clubsStorage.read()
    
    return NextResponse.json({
      success: true,
      message: 'Successfully migrated clubs to blob storage',
      migratedCount: migratedClubs.length,
      clubs: migratedClubs.map(c => ({ id: c.id, name: c.name }))
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate clubs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
