import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

/**
 * API route to apply database schema updates for PostgreSQL migration
 * This route should be called once to update the database schema before data migration
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'apply-schema') {
      console.log('Applying database schema...')
      
      // Create or update news table
      await sql`
        CREATE TABLE IF NOT EXISTS news (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT,
          author TEXT,
          date TEXT NOT NULL,
          image_url TEXT,
          image_alt TEXT,
          tags JSONB DEFAULT '[]',
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create or update competitions table
      await sql`
        CREATE TABLE IF NOT EXISTS competitions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          end_date TEXT,
          location TEXT,
          organizer TEXT,
          contact_email TEXT,
          registration_url TEXT,
          entry_fee TEXT,
          disciplines JSONB DEFAULT '[]',
          categories JSONB DEFAULT '[]',
          max_participants INTEGER,
          current_participants INTEGER DEFAULT 0,
          status TEXT DEFAULT 'upcoming',
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create or update records table
      await sql`
        CREATE TABLE IF NOT EXISTS records (
          id TEXT PRIMARY KEY,
          archer_name TEXT NOT NULL,
          club TEXT NOT NULL,
          category TEXT NOT NULL,
          discipline TEXT NOT NULL,
          distance TEXT,
          score TEXT NOT NULL,
          max_score TEXT,
          year INTEGER,
          location TEXT,
          verified BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create or update sponsors table
      await sql`
        CREATE TABLE IF NOT EXISTS sponsors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          website_url TEXT,
          logo_url TEXT,
          contact_email TEXT,
          phone TEXT,
          priority INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create or update clubs table
      await sql`
        CREATE TABLE IF NOT EXISTS clubs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          address TEXT,
          postal_code TEXT,
          city TEXT,
          phone TEXT,
          email TEXT,
          website TEXT,
          contact_person TEXT,
          latitude DECIMAL,
          longitude DECIMAL,
          facilities JSONB DEFAULT '[]',
          disciplines JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create or update calendar_events table
      await sql`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          end_date TEXT,
          time TEXT,
          end_time TEXT,
          location TEXT,
          type TEXT DEFAULT 'other',
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
      
      // Create or update board_members table
      await sql`
        CREATE TABLE IF NOT EXISTS board_members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          bio TEXT,
          image_url TEXT,
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      console.log('✅ Database schema applied successfully')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema applied successfully' 
      })
      
    } else if (action === 'migrate-data') {
      console.log('Starting data migration from unified storage to PostgreSQL...')
      
      // Import migration functions
      const { runFullMigration } = await import('@/../scripts/migrate-blob-to-postgres')
      await runFullMigration()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Data migration completed. Check logs for details.' 
      })
      
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "apply-schema" or "migrate-data"' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Schema/migration error:', error)
    return NextResponse.json(
      { success: false, message: `Error: ${error}` },
      { status: 500 }
    )
  }
}

// GET method to check current schema status
export async function GET() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    return NextResponse.json({
      success: true,
      tables: tables.map((t: any) => t.table_name),
      message: `Found ${tables.length} tables in the database`
    })
    
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      { success: false, message: `Error checking schema: ${error}` },
      { status: 500 }
    )
  }
}
