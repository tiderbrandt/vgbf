import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET() {
  try {
    console.log('DEBUG: Testing clubs and sponsors tables...')
    
    // Test clubs table
    const clubsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clubs'
      );
    `
    
    const clubsCount = await sql`SELECT COUNT(*) as total FROM clubs`
    const clubsSample = await sql`SELECT id, name FROM clubs LIMIT 5`
    
    // Test sponsors table  
    const sponsorsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsors'
      );
    `
    
    const sponsorsCount = await sql`SELECT COUNT(*) as total FROM sponsors`
    const sponsorsSample = await sql`SELECT id, name FROM sponsors LIMIT 5`
    
    // Handle Neon result format
    const getRows = (result: any) => Array.isArray(result) ? result : (result?.rows || [])
    
    return NextResponse.json({
      success: true,
      data: {
        clubs: {
          tableExists: getRows(clubsTableExists)[0]?.exists || false,
          count: getRows(clubsCount)[0]?.total || 0,
          sample: getRows(clubsSample)
        },
        sponsors: {
          tableExists: getRows(sponsorsTableExists)[0]?.exists || false,
          count: getRows(sponsorsCount)[0]?.total || 0,
          sample: getRows(sponsorsSample)
        }
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
