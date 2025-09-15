#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sql } from '../src/lib/database.ts'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrateSponsorData() {
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
      console.error('❌ Sponsors table does not exist!')
      process.exit(1)
    }
    
    // Clear existing sponsors
    await sql`DELETE FROM sponsors`
    console.log('🧹 Cleared existing sponsors')
    
    // Read sponsors from JSON
    const jsonPath = path.join(__dirname, '..', 'data', 'sponsors.json')
    const sponsorsJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    console.log(`📄 Found ${sponsorsJson.length} sponsors in JSON file`)
    
    // Insert each sponsor
    for (const sponsor of sponsorsJson) {
      await sql`
        INSERT INTO sponsors (
          id, name, description, website_url, logo_url, logo_alt, 
          priority, is_active, created_at, updated_at
        ) VALUES (
          ${sponsor.id}, 
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
      console.log(`✅ Migrated sponsor: ${sponsor.name}`)
    }
    
    // Verify the migration
    const count = await sql`SELECT COUNT(*) as total FROM sponsors WHERE is_active = true`
    console.log(`🎉 Migration complete! ${count[0]?.total} active sponsors in database`)
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateSponsorData()