import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging sponsors in database...')
    
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sponsors'
      );
    `
    const tableExists = tableCheck[0]?.exists || false
    console.log('Table exists:', tableExists)
    
    if (!tableExists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sponsors table does not exist!' 
      })
    }
    
    // Get table structure
    const structure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sponsors'
      ORDER BY ordinal_position;
    `
    console.log('Table structure:', structure)
    
    // Count total records
    const count = await sql`SELECT COUNT(*) as total FROM sponsors`
    const totalCount = count[0]?.total
    console.log('Total sponsors:', totalCount)
    
    // Get ALL sponsors (not just active ones) - using simple SELECT *
    const allSponsors = await sql`
      SELECT * FROM sponsors 
      ORDER BY priority ASC, name ASC
    `
    
    console.log('Sponsors found:', allSponsors.length)
    console.log('Raw sponsor data:', JSON.stringify(allSponsors, null, 2))
    
    const result = {
      success: true,
      tableExists,
      totalCount: totalCount?.toString(),
      tableStructure: structure,
      allSponsors: allSponsors,
      activeSponsors: allSponsors.filter((s: any) => s.is_active === true)
    }
    
    console.log('Debug result:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}