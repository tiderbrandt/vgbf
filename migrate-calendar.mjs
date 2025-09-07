import { readFileSync } from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function migrateCalendarEvents() {
  console.log('📅 Starting calendar events migration to PostgreSQL...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Read calendar events data
    const eventsData = JSON.parse(readFileSync('./data/calendar.json', 'utf-8'));
    console.log(`📋 Found ${eventsData.length} calendar events to migrate`);

    // Clear existing calendar events (for fresh migration)
    await client.query('DELETE FROM calendar_events');
    console.log('🧹 Cleared existing calendar events data');

    // Insert each event
    for (const event of eventsData) {
      try {
        // Map JSON fields to database schema
        const query = `
          INSERT INTO calendar_events (
            id,
            title,
            description,
            start_date,
            end_date,
            start_time,
            end_time,
            location,
            event_type,
            organizer,
            contact_email,
            registration_required,
            registration_url,
            max_participants,
            current_participants,
            status,
            is_public
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `;

        // Generate UUID for each event
        const eventId = crypto.randomUUID();

        const values = [
          eventId,
          event.title,
          event.description || null,
          event.date, // start_date
          event.endDate || null, // end_date
          event.time || null, // start_time
          event.endTime || null, // end_time
          event.location || null,
          event.type || 'other', // event_type
          event.organizer || null,
          event.contactEmail || null, // contact_email
          event.registrationRequired || false, // registration_required
          event.registrationUrl || null, // registration_url
          event.maxParticipants || null, // max_participants
          event.currentParticipants || 0, // current_participants
          event.status || 'upcoming',
          event.isPublic !== false // is_public (default true if not specified)
        ];

        await client.query(query, values);
        console.log(`✅ Migrated: ${event.title} (${event.date})`);
        
      } catch (error) {
        console.error(`❌ Error migrating event "${event.title}":`, error.message);
      }
    }

    // Verify migration
    const result = await client.query('SELECT COUNT(*) as count FROM calendar_events');
    console.log(`📅 Migration complete! ${result.rows[0].count} events in database`);

    // Show sample data organized by type
    const typeStats = await client.query(`
      SELECT event_type, COUNT(*) as count 
      FROM calendar_events 
      GROUP BY event_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Events by type:');
    typeStats.rows.forEach(row => {
      console.log(`   ${row.event_type}: ${row.count} events`);
    });

    // Show upcoming events
    const upcoming = await client.query(`
      SELECT title, start_date, location, event_type 
      FROM calendar_events 
      WHERE status = 'upcoming' 
      ORDER BY start_date 
      LIMIT 5
    `);
    
    console.log('\n📋 Upcoming events:');
    upcoming.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.title} - ${row.start_date} (${row.event_type})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

migrateCalendarEvents();
