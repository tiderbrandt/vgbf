import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

/**
 * API route to deploy the optimal PostgreSQL schema for a fresh start
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'deploy-optimal-schema') {
      console.log('🚀 Deploying optimal PostgreSQL schema...')
      
      // Read and execute the optimal schema
      const schemaStatements = [
        // Enable UUID extension
        `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
        
        // Drop existing tables for fresh start
        `DROP TABLE IF EXISTS board_members CASCADE`,
        `DROP TABLE IF EXISTS sponsors CASCADE`,
        `DROP TABLE IF EXISTS calendar_events CASCADE`,
        `DROP TABLE IF EXISTS district_records CASCADE`,
        `DROP TABLE IF EXISTS competitions CASCADE`,
        `DROP TABLE IF EXISTS news_articles CASCADE`,
        `DROP TABLE IF EXISTS clubs CASCADE`,
        
        // Create clubs table (foundational)
        `CREATE TABLE clubs (
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
        )`,
        
        // Create news_articles table
        `CREATE TABLE news_articles (
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
        )`,
        
        // Create competitions table
        `CREATE TABLE competitions (
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
        )`,
        
        // Create district_records table
        `CREATE TABLE district_records (
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
        )`,
        
        // Create calendar_events table
        `CREATE TABLE calendar_events (
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
        )`,
        
        // Create sponsors table
        `CREATE TABLE sponsors (
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
        )`,
        
        // Create board_members table
        `CREATE TABLE board_members (
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
        )`
      ]
      
      // Create indexes
      const indexStatements = [
        `CREATE INDEX idx_news_slug ON news_articles(slug)`,
        `CREATE INDEX idx_news_published ON news_articles(published_date DESC, is_published)`,
        `CREATE INDEX idx_news_featured ON news_articles(is_featured, published_date DESC)`,
        `CREATE INDEX idx_news_tags ON news_articles USING GIN(tags)`,
        
        `CREATE INDEX idx_competitions_date ON competitions(start_date)`,
        `CREATE INDEX idx_competitions_status ON competitions(status)`,
        `CREATE INDEX idx_competitions_category ON competitions(category)`,
        
        `CREATE INDEX idx_records_category ON district_records(category)`,
        `CREATE INDEX idx_records_class ON district_records(class)`,
        `CREATE INDEX idx_records_date ON district_records(competition_date DESC)`,
        `CREATE INDEX idx_records_club ON district_records(club_id)`,
        
        `CREATE INDEX idx_clubs_active ON clubs(is_active)`,
        `CREATE INDEX idx_clubs_city ON clubs(city)`,
        `CREATE INDEX idx_clubs_name ON clubs(name)`,
        
        `CREATE INDEX idx_events_date ON calendar_events(start_date)`,
        `CREATE INDEX idx_events_type ON calendar_events(event_type)`,
        `CREATE INDEX idx_events_status ON calendar_events(status)`,
        `CREATE INDEX idx_events_public ON calendar_events(is_public)`,
        
        `CREATE INDEX idx_sponsors_active ON sponsors(is_active, priority)`,
        `CREATE INDEX idx_sponsors_level ON sponsors(sponsorship_level)`,
        
        `CREATE INDEX idx_board_category ON board_members(category, display_order)`,
        `CREATE INDEX idx_board_active ON board_members(is_active)`,
        `CREATE INDEX idx_board_club ON board_members(club_id)`
      ]
      
      console.log('📊 Executing schema statements...')
      
      // Execute all schema statements
      for (let i = 0; i < schemaStatements.length; i++) {
        console.log(`➡️ Executing schema statement ${i + 1}/${schemaStatements.length}`)
        await sql.query(schemaStatements[i])
      }
      
      console.log('🔍 Creating performance indexes...')
      
      // Execute all index statements
      for (let i = 0; i < indexStatements.length; i++) {
        console.log(`➡️ Creating index ${i + 1}/${indexStatements.length}`)
        await sql.query(indexStatements[i])
      }
      
      console.log('✅ Optimal schema deployed successfully!')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Optimal PostgreSQL schema deployed successfully',
        tablesCreated: 7,
        indexesCreated: indexStatements.length
      })
      
    } else if (action === 'check-schema') {
      console.log('🔍 Checking current schema...')
      
      const tables = await sql`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `
      
      const indexes = await sql`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `
      
      return NextResponse.json({
        success: true,
        tables: tables,
        indexes: indexes,
        summary: `Found ${tables.length} tables and ${indexes.length} indexes`
      })
      
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "deploy-optimal-schema" or "check-schema"' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Schema deployment error:', error)
    return NextResponse.json(
      { success: false, message: `Error: ${error}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    return NextResponse.json({
      success: true,
      message: 'Database schema information',
      tables: result
    })
    
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      { success: false, message: `Error checking schema: ${error}` },
      { status: 500 }
    )
  }
}
