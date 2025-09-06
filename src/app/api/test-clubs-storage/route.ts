import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing clubs storage...')
    
    // Try to import and use the clubs storage
    const { getAllClubs } = await import('@/lib/clubs-storage-unified')
    
    console.log('Reading clubs data...')
    const clubs = await getAllClubs()
    console.log('Clubs count:', clubs.length)
    
    return NextResponse.json({
      success: true,
      message: 'Clubs storage test completed successfully',
      clubsCount: clubs.length,
      sampleClub: clubs[0] || null,
      environment: process.env.NODE_ENV
    })
    
  } catch (error) {
    console.error('Clubs storage test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Clubs storage test failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}
