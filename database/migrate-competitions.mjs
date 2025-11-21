import { readFileSync } from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

async function migrateCompetitions() {
    console.log('🚀 Starting competitions migration to PostgreSQL...');

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');

        // Read competitions data
        const competitionsData = JSON.parse(readFileSync('./data/competitions.json', 'utf-8'));
        console.log(`📋 Found ${competitionsData.length} competitions to migrate`);

        // Clear existing competitions (for fresh migration)
        await client.query('DELETE FROM competitions');
        console.log('🧹 Cleared existing competitions data');

        // Insert each competition
        for (const comp of competitionsData) {
            try {
                // Map JSON fields to database schema
                const query = `
          INSERT INTO competitions (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            organizer,
            contact_email,
            registration_url,
            results_url,
            entry_fee,
            equipment,
            max_participants,
            current_participants,
            category,
            status,
            is_external,
            image_url,
            image_alt
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `;

                // Generate a UUID for each competition (don't use the simple numeric IDs)
                const competitionId = crypto.randomUUID();

                const values = [
                    competitionId,
                    comp.title,
                    comp.description || null,
                    comp.date || comp.start_date, // Handle both field names
                    comp.end_date || comp.date || comp.start_date, // Use end_date if available, otherwise same as start
                    comp.location,
                    comp.organizer,
                    comp.contactEmail || comp.contact_email || null,
                    comp.registrationUrl || comp.registration_url || null,
                    comp.resultsUrl || comp.results_url || null,
                    comp.fee || comp.entry_fee || null,
                    JSON.stringify(comp.equipment || []),
                    comp.maxParticipants || comp.max_participants || null,
                    comp.currentParticipants || comp.current_participants || 0,
                    comp.category || 'other',
                    comp.status || 'upcoming',
                    comp.isExternal || comp.is_external || false,
                    comp.imageUrl || comp.image_url || null,
                    comp.imageAlt || comp.image_alt || null
                ];

                await client.query(query, values);
                console.log(`✅ Migrated: ${comp.title}`);

            } catch (error) {
                console.error(`❌ Error migrating competition "${comp.title}":`, error.message);
            }
        }

        // Verify migration
        const result = await client.query('SELECT COUNT(*) as count FROM competitions');
        console.log(`🎯 Migration complete! ${result.rows[0].count} competitions in database`);

        // Show sample data
        const sample = await client.query('SELECT title, start_date, location, organizer FROM competitions ORDER BY start_date LIMIT 5');
        console.log('\n📋 Sample competitions:');
        sample.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.title} - ${row.start_date} (${row.location})`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

migrateCompetitions();
