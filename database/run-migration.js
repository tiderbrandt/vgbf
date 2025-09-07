const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function run() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql')
        const schema = fs.readFileSync(schemaPath, 'utf8')

        const statements = schema
            .split(/;\s*(?=CREATE|ALTER|DROP|COMMENT|INSERT|CREATE EXTENSION|CREATE OR REPLACE|--)/i)
            .map(s => s.trim())
            .filter(Boolean)

        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
            console.error('DATABASE_URL not set in environment')
            process.exit(1)
        }

        const pool = new Pool({ connectionString })
        const failures = []
        try {
            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i]
                if (!stmt) continue
                console.log(`Executing statement ${i + 1}/${statements.length}`)
                try {
                    await pool.query(stmt)
                } catch (err) {
                    console.warn(`Statement ${i + 1} failed (continuing):`, err.message || err)
                    failures.push({ index: i + 1, statement: stmt.substring(0, 200), error: err })
                }
            }
        } finally {
            await pool.end()
        }

        if (failures.length === 0) {
            console.log('Migration completed successfully')
            process.exit(0)
        } else {
            console.warn(`Migration completed with ${failures.length} failed statements`)
            failures.forEach(f => console.warn(`#${f.index} error:`, f.error.message || f.error))
            process.exit(2)
        }
    } catch (err) {
        console.error('Migration failed:', err)
        process.exit(2)
    }
}

run()
