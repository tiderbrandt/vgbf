const { sql } = require('./src/lib/database.ts');

async function addMissingColumns() {
    try {
        console.log('Adding missing columns to competitions table...');
        await sql`ALTER TABLE competitions ADD COLUMN IF NOT EXISTS registration_deadline DATE`;
        await sql`ALTER TABLE competitions ADD COLUMN IF NOT EXISTS rules TEXT`;
        console.log('✓ Added registration_deadline and rules columns');
        console.log('Schema update complete!');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        process.exit(0);
    }
}

addMissingColumns();
