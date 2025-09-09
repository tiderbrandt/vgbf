import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

console.log('🔍 Checking calendar_events table...')

try {
    // Check if table exists
    const tableCheck = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'calendar_events'
    );
  `

    const tableExists = tableCheck[0]?.exists
    console.log('📊 Table exists:', tableExists)

    if (!tableExists) {
        console.log('🔧 Creating calendar_events table...')

        // Create UUID extension if not exists
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

        // Create calendar_events table
        await sql`
      CREATE TABLE calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        start_time TIME,
        end_time TIME,
        location TEXT,
        event_type TEXT DEFAULT 'other',
        organizer TEXT,
        contact_email TEXT,
        registration_required BOOLEAN DEFAULT false,
        registration_url TEXT,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        status TEXT DEFAULT 'upcoming',
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // Create indexes
        await sql`CREATE INDEX idx_events_date ON calendar_events(start_date)`
        await sql`CREATE INDEX idx_events_type ON calendar_events(event_type)`
        await sql`CREATE INDEX idx_events_status ON calendar_events(status)`
        await sql`CREATE INDEX idx_events_public ON calendar_events(is_public)`

        console.log('✅ Calendar events table created successfully!')
    }

    // Test a simple query
    const eventCount = await sql`SELECT COUNT(*) as count FROM calendar_events`
    console.log('📊 Current event count:', eventCount[0].count)

    console.log('🎉 Calendar database setup complete!')

} catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
}
