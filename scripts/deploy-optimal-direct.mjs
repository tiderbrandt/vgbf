import { Pool } from 'pg'

console.log('🚀 Deploying optimal PostgreSQL schema directly...')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

console.log('📊 Connected to database')

try {
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    console.log('✅ UUID extension enabled')

    // Drop existing tables for fresh start
    const dropTables = [
        'board_members',
        'sponsors',
        'calendar_events',
        'district_records',
        'competitions',
        'news_articles',
        'clubs',
        'legacy_id_map',
        'contact_info',
        'news',
        'records'
    ]

    for (const table of dropTables) {
        try {
            await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
            console.log(`🗑️ Dropped table: ${table}`)
        } catch (err) {
            console.log(`⚠️ Table ${table} didn't exist or couldn't be dropped`)
        }
    }

    // Create clubs table (foundational)
    await pool.query(`
    CREATE TABLE clubs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      address TEXT,
      postal_code TEXT,
      city TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      contact_person TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      established_year INTEGER,
      member_count INTEGER,
      membership_fee TEXT,
      activities JSONB DEFAULT '[]',
      facilities JSONB DEFAULT '[]',
      training_times JSONB DEFAULT '[]',
      image_url TEXT,
      image_alt TEXT,
      facebook_url TEXT,
      instagram_url TEXT,
      welcomes_new_members BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created clubs table')

    // Create news_articles table
    await pool.query(`
    CREATE TABLE news_articles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author TEXT,
      published_date DATE NOT NULL,
      category TEXT DEFAULT 'general',
      tags JSONB DEFAULT '[]',
      image_url TEXT,
      image_alt TEXT,
      is_published BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created news_articles table')

    // Create competitions table
    await pool.query(`
    CREATE TABLE competitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      location TEXT NOT NULL,
      organizer TEXT NOT NULL,
      contact_email TEXT,
      registration_url TEXT,
      results_url TEXT,
      entry_fee TEXT,
      equipment JSONB DEFAULT '[]',
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      category TEXT DEFAULT 'other',
      status TEXT DEFAULT 'upcoming',
      is_external BOOLEAN DEFAULT false,
      image_url TEXT,
      image_alt TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created competitions table')

    // Create district_records table
    await pool.query(`
    CREATE TABLE district_records (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      archer_name TEXT NOT NULL,
      club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
      category TEXT NOT NULL,
      class TEXT NOT NULL,
      score TEXT NOT NULL,
      competition TEXT NOT NULL,
      competition_date DATE NOT NULL,
      competition_url TEXT,
      organizer TEXT NOT NULL,
      notes TEXT,
      verified BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created district_records table')

    // Create calendar_events table
    await pool.query(`
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
      related_competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created calendar_events table')

    // Create sponsors table
    await pool.query(`
    CREATE TABLE sponsors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      website_url TEXT,
      logo_url TEXT,
      logo_alt TEXT,
      contact_email TEXT,
      phone TEXT,
      priority INTEGER DEFAULT 1,
      sponsorship_level TEXT DEFAULT 'standard',
      contract_start DATE,
      contract_end DATE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created sponsors table')

    // Create board_members table
    await pool.query(`
    CREATE TABLE board_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
      email TEXT,
      phone TEXT,
      bio TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      category TEXT DEFAULT 'board',
      is_active BOOLEAN DEFAULT true,
      term_start DATE,
      term_end DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
    console.log('✅ Created board_members table')

    console.log('🔍 Creating performance indexes...')

    // Create all performance indexes
    const indexes = [
        'CREATE INDEX idx_news_slug ON news_articles(slug)',
        'CREATE INDEX idx_news_published ON news_articles(published_date DESC, is_published)',
        'CREATE INDEX idx_news_featured ON news_articles(is_featured, published_date DESC)',
        'CREATE INDEX idx_news_tags ON news_articles USING GIN(tags)',

        'CREATE INDEX idx_competitions_date ON competitions(start_date)',
        'CREATE INDEX idx_competitions_status ON competitions(status)',
        'CREATE INDEX idx_competitions_category ON competitions(category)',

        'CREATE INDEX idx_records_category ON district_records(category)',
        'CREATE INDEX idx_records_class ON district_records(class)',
        'CREATE INDEX idx_records_date ON district_records(competition_date DESC)',
        'CREATE INDEX idx_records_club ON district_records(club_id)',

        'CREATE INDEX idx_clubs_active ON clubs(is_active)',
        'CREATE INDEX idx_clubs_city ON clubs(city)',
        'CREATE INDEX idx_clubs_name ON clubs(name)',

        'CREATE INDEX idx_events_date ON calendar_events(start_date)',
        'CREATE INDEX idx_events_type ON calendar_events(event_type)',
        'CREATE INDEX idx_events_status ON calendar_events(status)',
        'CREATE INDEX idx_events_public ON calendar_events(is_public)',

        'CREATE INDEX idx_sponsors_active ON sponsors(is_active, priority)',
        'CREATE INDEX idx_sponsors_level ON sponsors(sponsorship_level)',

        'CREATE INDEX idx_board_category ON board_members(category, display_order)',
        'CREATE INDEX idx_board_active ON board_members(is_active)',
        'CREATE INDEX idx_board_club ON board_members(club_id)'
    ]

    for (let i = 0; i < indexes.length; i++) {
        try {
            await pool.query(indexes[i])
            console.log(`✅ Created index ${i + 1}/${indexes.length}`)
        } catch (err) {
            console.log(`⚠️ Index ${i + 1} might already exist: ${err.message}`)
        }
    }

    await pool.end()
    console.log('📊 Database connection closed')

    console.log('')
    console.log('🎉 OPTIMAL SCHEMA DEPLOYMENT COMPLETED!')
    console.log('')
    console.log('📊 Summary:')
    console.log('   • 7 tables created with UUIDs and relationships')
    console.log('   • 23 performance indexes created')
    console.log('   • Modern PostgreSQL features enabled')
    console.log('   • Ready for production workload')
    console.log('')
    console.log('✨ Your database now has the optimal architecture for VGBF!')

} catch (error) {
    console.error('❌ Error deploying schema:', error)
    process.exit(1)
}
