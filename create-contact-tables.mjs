import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createContactTables() {
  try {
    console.log('🔄 Creating contact tables in PostgreSQL...');
    
    // Create main contact table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_main (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        name TEXT NOT NULL,
        club TEXT,
        phone TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contact_main table');

    // Create postal address table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_postal_address (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        street TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        city TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contact_postal_address table');

    // Create organization table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_organization (
        id SERIAL PRIMARY KEY,
        organization_number TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contact_organization table');

    // Create quick links table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_quick_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        is_external BOOLEAN DEFAULT FALSE,
        order_num INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contact_quick_links table');

    // Create FAQ table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_faq (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        order_num INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Created contact_faq table');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_quick_links_order ON contact_quick_links(order_num)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_quick_links_active ON contact_quick_links(is_active)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_faq_order ON contact_faq(order_num)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_faq_active ON contact_faq(is_active)`);
    console.log('✅ Created indexes');

    console.log('🎉 Contact tables created successfully!');
    
  } catch (error) {
    console.error('💥 Failed to create contact tables:', error);
  } finally {
    await pool.end();
  }
}

createContactTables();
