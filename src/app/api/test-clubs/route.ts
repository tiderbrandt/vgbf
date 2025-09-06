import { NextRequest, NextResponse } from 'next/server'
import { getAllClubs } from '@/lib/clubs-storage-unified'

export async function GET() {
  try {
    console.log('Testing clubs storage unified...')
    const clubs = await getAllClubs()
    console.log(`Retrieved ${clubs.length} clubs successfully`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Unified storage working correctly',
      clubCount: clubs.length,
      firstClub: clubs[0] || null
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
