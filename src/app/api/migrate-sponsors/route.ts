import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🤝 Starting sponsor migration from JSON to database...')
    
    // Check if sponsors table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sponsors'
      );
    `
    
    if (!tableCheck[0]?.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sponsors table does not exist!' 
      }, { status: 500 })
    }
    
    // Clear existing sponsors completely
    await sql`DELETE FROM sponsors`
    console.log('🧹 Cleared existing sponsors')
    
    // Read sponsors from JSON
    const jsonPath = path.join(process.cwd(), 'data', 'sponsors.json')
    const sponsorsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    console.log(`📄 Found ${sponsorsJson.length} sponsors in JSON file`)
    
    // Insert each sponsor with proper UUID
    for (const sponsor of sponsorsJson) {
      const sponsorId = randomUUID() // Generate a proper UUID
      
      await sql`
        INSERT INTO sponsors (
          id, name, description, website_url, logo_url, logo_alt, 
          priority, is_active, created_at, updated_at
        ) VALUES (
          ${sponsorId}, 
          ${sponsor.name}, 
          ${sponsor.description || ''}, 
          ${sponsor.website || ''}, 
          ${sponsor.logoUrl || ''}, 
          ${sponsor.logoAlt || ''}, 
          ${sponsor.priority || 99}, 
          ${sponsor.isActive !== false}, 
          NOW(), 
          NOW()
        )
      `
      console.log(`✅ Migrated sponsor: ${sponsor.name} with UUID: ${sponsorId}`)
    }
    
    // Verify the migration
    const count = await sql`SELECT COUNT(*) as total FROM sponsors WHERE is_active = true`
    console.log(`🎉 Migration complete! ${count[0]?.total} active sponsors in database`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${sponsorsJson.length} sponsors to database with new UUIDs`,
      activeCount: count[0]?.total 
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}