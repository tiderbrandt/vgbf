import { NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET() {
  try {
    console.log('DEBUG: Testing direct database queries...')
    
    // Test 1: Basic connection test
    const testResult = await sql`SELECT 1 as test`
    console.log('Test 1 - Raw result:', testResult)
    console.log('Test 1 - Result keys:', Object.keys(testResult))
    console.log('Test 1 - Has rows?', 'rows' in testResult)
    console.log('Test 1 - Rows type:', typeof testResult.rows)
    console.log('Test 1 - Basic connection:', testResult.rows?.[0])
    
    // Test 2: Check if competitions table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'competitions'
      );
    `
    console.log('Test 2 - Table exists result:', tableExists)
    console.log('Test 2 - Table exists:', tableExists.rows?.[0])
    
    // Test 3: Count total rows in competitions table
    const countResult = await sql`SELECT COUNT(*) as total FROM competitions`
    console.log('Test 3 - Count result:', countResult)
    console.log('Test 3 - Total competitions:', countResult.rows?.[0])
    
    return NextResponse.json({
      success: true,
      data: {
        connectionTest: testResult.rows?.[0] || testResult,
        tableExists: tableExists.rows?.[0] || tableExists,
        totalCount: countResult.rows?.[0] || countResult,
        rawDebug: {
          testResultType: typeof testResult,
          testResultKeys: Object.keys(testResult),
          hasRows: 'rows' in testResult,
          rowsType: typeof testResult.rows
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
