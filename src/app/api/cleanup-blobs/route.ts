import { NextRequest, NextResponse } from 'next/server'
import { del, list } from '@vercel/blob'

export async function POST() {
  try {
    console.log('Cleaning up old blob files...')
    
    const { blobs } = await list()
    
    // Find the old clubs.json file (without data/ prefix)
    const oldClubsBlob = blobs.find(blob => blob.pathname === 'clubs.json')
    
    if (oldClubsBlob) {
      console.log('Found old clubs.json blob, deleting...')
      await del(oldClubsBlob.url)
      console.log('Deleted old clubs.json blob')
    } else {
      console.log('No old clubs.json blob found')
    }
    
    // List remaining blobs
    const { blobs: remainingBlobs } = await list()
    const clubsBlobs = remainingBlobs.filter(blob => 
      blob.pathname.includes('clubs')
    )
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deletedOldBlob: !!oldClubsBlob,
      remainingClubsBlobs: clubsBlobs.map(blob => ({
        pathname: blob.pathname,
        size: blob.size
      }))
    })
    
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
