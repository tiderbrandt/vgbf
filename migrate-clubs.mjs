import pkg from 'pg';
import fs from 'fs';
import { randomUUID } from 'crypto';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateClubsData() {
  try {
    console.log('🔄 Starting clubs data migration from blob storage to PostgreSQL...');
    
    // Read clubs data from local JSON file
    const clubsData = JSON.parse(fs.readFileSync('data/clubs.json', 'utf8'));
    console.log(`📂 Found ${clubsData.length} clubs in local data`);
    
    // Clear existing data (if any)
    await pool.query('DELETE FROM clubs');
    console.log('🗑️ Cleared existing club data');
    
    // Keep track of old ID to new UUID mapping for reference
    const idMapping = {};
    
    // Insert clubs data
    for (const club of clubsData) {
      console.log(`📝 Migrating: ${club.name}`);
      
      // Generate new UUID for the club
      const newUuid = randomUUID();
      idMapping[club.id] = newUuid;
      
      // Parse established year
      let establishedYear = null;
      if (club.established) {
        const year = parseInt(club.established);
        if (!isNaN(year)) {
          establishedYear = year;
        }
      }
      
      const insertQuery = `
        INSERT INTO clubs (
          id, name, description, contact_person, email, phone, website,
          address, postal_code, city, established_year, activities, facilities,
          training_times, member_count, membership_fee, welcomes_new_members,
          image_url, facebook_url, instagram_url, latitude, longitude, is_active,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      `;
      
      const now = new Date().toISOString();
      const values = [
        newUuid, // Use new UUID instead of original string ID
        club.name,
        club.description || '',
        club.contactPerson || '',
        club.email || '',
        club.phone || '',
        club.website || '',
        club.address || '',
        club.postalCode || '',
        club.city || '',
        establishedYear,
        JSON.stringify(club.activities || []),
        JSON.stringify(club.facilities || []),
        JSON.stringify(club.trainingTimes || []),
        club.memberCount || 0,
        club.membershipFee || '',
        club.welcomesNewMembers !== false,
        club.imageUrl || '',
        club.facebook || '',
        club.instagram || '',
        club.latitude || null,
        club.longitude || null,
        club.isActive !== false,
        now,
        now
      ];
      
      await pool.query(insertQuery, values);
    }
    
    // Verify migration
    const countResult = await pool.query('SELECT COUNT(*) as count FROM clubs');
    console.log(`✅ Migration completed! ${countResult.rows[0].count} clubs migrated to PostgreSQL`);
    
    // Show some sample data
    const sampleResult = await pool.query('SELECT name, city, email FROM clubs ORDER BY name LIMIT 5');
    console.log('\n📋 Sample migrated clubs:');
    sampleResult.rows.forEach(row => {
      console.log(`  🏛️ ${row.name} (${row.city}) - ${row.email}`);
    });
    
    // Show ID mapping for reference
    console.log('\n🔗 ID Mapping (old string ID → new UUID):');
    Object.entries(idMapping).slice(0, 3).forEach(([oldId, newUuid]) => {
      console.log(`  ${oldId} → ${newUuid}`);
    });
    console.log(`  ... and ${Object.keys(idMapping).length - 3} more`);
    
    await pool.end();
    console.log('\n🎉 Clubs migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrateClubsData();
