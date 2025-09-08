import { sql } from '../src/lib/database.js'
import fs from 'fs'
import path from 'path'

async function createUsersTables() {
    try {
        console.log('🚀 Creating users tables in Neon database...')

        // Read the SQL file
        const sqlContent = fs.readFileSync(path.join(process.cwd(), 'database', 'add-users-table.sql'), 'utf8')

        // Split SQL into individual statements (basic splitting by semicolon)
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

        console.log(`📋 Found ${statements.length} SQL statements to execute`)

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]
            if (statement.length > 10) { // Skip very short statements
                console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
                await sql.unsafe(statement)
                console.log(`✅ Statement ${i + 1} completed`)
            }
        }

        console.log('🎉 All users tables created successfully!')

        // Test if tables exist
        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_sessions', 'password_reset_tokens')
    `

        console.log('📊 Created tables:')
        tables.forEach(table => {
            console.log(`  ✓ ${table.table_name}`)
        })

        // Check if admin user was created
        const adminUser = await sql`
      SELECT username, email, role, is_active 
      FROM users 
      WHERE username = 'admin'
    `

        if (adminUser.length > 0) {
            console.log(`👤 Admin user created: ${adminUser[0].username} (${adminUser[0].email})`)
        }

    } catch (error) {
        console.error('❌ Error creating users tables:', error)
        process.exit(1)
    }
}

createUsersTables()
