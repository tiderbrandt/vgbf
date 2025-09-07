import { sql } from '../src/lib/database'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema
    console.log('📊 Creating tables and indexes...')
  // For multi-statement schema execution use sql.query(...) which the
  // centralized helper provides and which supports both neon and pg fallbacks.
  await sql.query(schema)
    
    console.log('✅ Database migration completed successfully!')
    
    // Test the connection
    console.log('🔍 Testing database connection...')
  const result = await sql.query('SELECT COUNT(*) as count FROM clubs')
  console.log(`📈 Clubs table ready with ${result.rows[0].count} records`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()
