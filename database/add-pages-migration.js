/**
 * Simple migration script to add pages table
 */

const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigration() {
  try {
    console.log('Starting pages table migration...');
    
    // Create the pages table
    await sql`
      CREATE TABLE IF NOT EXISTS pages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          author VARCHAR(255),
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
          featured_image VARCHAR(255),
          featured_image_alt VARCHAR(255),
          meta_title VARCHAR(500),
          meta_description TEXT,
          meta_keywords TEXT,
          template VARCHAR(50) DEFAULT 'default',
          show_in_navigation BOOLEAN DEFAULT false,
          navigation_order INTEGER DEFAULT 0,
          parent_page_id UUID REFERENCES pages(id),
          view_count INTEGER DEFAULT 0,
          featured BOOLEAN DEFAULT false,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✓ Created pages table');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pages_featured ON pages(featured)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pages_navigation ON pages(show_in_navigation, navigation_order)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at)`;
    
    console.log('✓ Created indexes');
    
    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_pages_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    // Create trigger
    await sql`
      CREATE TRIGGER update_pages_updated_at
          BEFORE UPDATE ON pages
          FOR EACH ROW
          EXECUTE FUNCTION update_pages_updated_at()
    `;
    
    console.log('✓ Created update trigger');
    
    // Insert example pages
    await sql`
      INSERT INTO pages (title, slug, content, excerpt, status, show_in_navigation, navigation_order, published_at) VALUES
      ('Om VGBF', 'om-vgbf', 
      '<h2>Välkommen till Västra Götalands Bågskytteförbund</h2>
      <p>Västra Götalands Bågskytteförbund (VGBF) är det regionala förbundet för bågskytte i Västra Götaland. Vi arbetar för att främja och utveckla bågskyttesporten i regionen.</p>
      
      <h3>Vår verksamhet</h3>
      <p>VGBF organiserar tävlingar, kurser och andra aktiviteter för bågskyttar i alla åldrar och på alla nivåer. Vi samarbetar nära med våra medlemsklubbar för att erbjuda den bästa möjliga bågskytteupplevelsen.</p>',
      'Lär dig mer om Västra Götalands Bågskytteförbund, våra värderingar och verksamhet.',
      'published', true, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (slug) DO NOTHING
    `;
    
    console.log('✓ Inserted example pages');
    
    // Test the table
    const result = await sql`SELECT COUNT(*) as count FROM pages`;
    console.log(`📊 Pages table contains ${result[0].count} records`);
    
    console.log('✅ Pages table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();