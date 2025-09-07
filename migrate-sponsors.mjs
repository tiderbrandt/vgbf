import pkg from 'pg';
import fs from 'fs';
import crypto from 'crypto';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateSponsorsData() {
  try {
    console.log('🔄 Starting sponsors data migration from blob storage to PostgreSQL...');
    
    // Read sponsors data from local JSON file
    const sponsorsData = JSON.parse(fs.readFileSync('data/sponsors.json', 'utf8'));
    console.log(`📂 Found ${sponsorsData.length} sponsors in local data`);
    
    // Clear existing data (if any)
    await pool.query('DELETE FROM sponsors');
    console.log('🗑️ Cleared existing sponsor data');
    
    // Insert sponsors data
    for (const sponsor of sponsorsData) {
      console.log(`📝 Migrating: ${sponsor.name}`);
      
      // Generate UUID for the sponsor
      const uuid = crypto.randomUUID();
      
      const insertQuery = `
        INSERT INTO sponsors (
          id, name, description, website_url, logo_url, logo_alt, 
          priority, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const now = new Date().toISOString();
      const values = [
        uuid, // Use generated UUID instead of original ID
        sponsor.name,
        sponsor.description || null,
        sponsor.website || null, // Map to website_url
        sponsor.logoUrl || null,
        sponsor.logoAlt || null,
        sponsor.priority || 1,
        sponsor.isActive !== false,
        sponsor.addedDate || now,
        sponsor.updatedAt || now
      ];
      
      await pool.query(insertQuery, values);
      console.log(`🔗 ID Mapping: ${sponsor.id} → ${uuid}`);
    }
    
    // Verify migration
    const countResult = await pool.query('SELECT COUNT(*) as count FROM sponsors');
    console.log(`✅ Migration completed! ${countResult.rows[0].count} sponsors migrated to PostgreSQL`);
    
    // Show migrated data
    const sampleResult = await pool.query('SELECT id, name, website_url, is_active, priority FROM sponsors ORDER BY priority');
    console.log('\n📋 Migrated sponsors:');
    sampleResult.rows.forEach(row => {
      console.log(`  🏢 ${row.name} (ID: ${row.id}) - Priority: ${row.priority} - Active: ${row.is_active} - Website: ${row.website_url}`);
    });
    
    await pool.end();
    console.log('\n🎉 Sponsors migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrateSponsorsData();
