const { sql } = require('../src/lib/database.ts')
const fs = require('fs')
const path = require('path')

async function runMigration() {
    try {
        console.log('🚀 Starting database migration...')

        // Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql')
        const schema = fs.readFileSync(schemaPath, 'utf8')

        // Execute the schema
        console.log('📊 Creating tables and indexes...')
    // Use the exported sql helper. For multi-statement schema execution
    // use the conventional sql.query(...) form which the helper exposes.
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
