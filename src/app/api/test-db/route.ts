import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing simple database queries...')
    
    // Test 1: Count
    const count = await sql`SELECT COUNT(*) as total FROM sponsors`
    console.log('Test 1 - Count result:', count)
    
    // Test 2: Simple select with LIMIT
    const limited = await sql`SELECT * FROM sponsors LIMIT 3`
    console.log('Test 2 - Limited select:', limited)
    
    // Test 3: Raw text query
    const rawResult = await sql`SELECT id::text, name FROM sponsors`
    console.log('Test 3 - Raw text query:', rawResult)
    
    return NextResponse.json({ 
      success: true,
      count: count,
      limited: limited,
      rawResult: rawResult
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}