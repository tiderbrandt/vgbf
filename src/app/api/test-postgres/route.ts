import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST() {
  try {
    console.log('🧪 Testing PostgreSQL connection and schema...')
    
    // Test basic connection
    const connectionTest = await query('SELECT version()')
    console.log('✅ PostgreSQL connection successful:', connectionTest.rows[0].version)
    
    // Check if clubs table exists and its structure
    const tableInfo = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clubs' 
      ORDER BY ordinal_position
    `)
    
    console.log('📊 Clubs table structure:')
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })
    
    // Check current club count
    const clubCount = await query('SELECT COUNT(*) as count FROM clubs')
    console.log(`📈 Current clubs in PostgreSQL: ${clubCount.rows[0].count}`)
    
    // Test inserting a sample club
    const testClub = {
      id: 'test-club-' + Date.now(),
      name: 'Test Club',
      description: 'A test club',
      location: 'Test Location',
      email: 'test@example.com',
      city: 'Test City',
      activities: ['Test Activity'],
      welcomes_new_members: true
    }
    
    console.log('🧪 Testing club insertion...')
    const insertResult = await query(`
      INSERT INTO clubs (
        id, name, description, location, email, city, activities, welcomes_new_members
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name
    `, [
      testClub.id, testClub.name, testClub.description, testClub.location,
      testClub.email, testClub.city, testClub.activities, testClub.welcomes_new_members
    ])
    
    console.log('✅ Test club inserted:', insertResult.rows[0])
    
    // Clean up test club
    await query('DELETE FROM clubs WHERE id = $1', [testClub.id])
    console.log('🧹 Test club cleaned up')
    
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database test completed successfully',
      version: connectionTest.rows[0].version,
      tableColumns: tableInfo.rows.length,
      currentClubCount: clubCount.rows[0].count,
      testInsertSuccessful: true
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
