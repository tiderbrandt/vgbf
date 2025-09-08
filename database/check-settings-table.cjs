const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Load environment
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim();
    }
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const sql = neon(process.env.DATABASE_URL);

async function checkTable() {
    try {
        const result = await sql`SELECT key, description, created_at FROM admin_settings ORDER BY created_at`;
        console.log('📋 Admin Settings Table Contents:');
        result.forEach(row => {
            console.log(`   ${row.key}: ${row.description} (created: ${new Date(row.created_at).toLocaleString('sv-SE')})`);
        });

        const backups = await sql`SELECT key, description FROM admin_settings WHERE key LIKE 'backup_%'`;
        console.log(`\n💾 Found ${backups.length} backup(s) in database`);
        backups.forEach(backup => {
            console.log(`   ${backup.key}: ${backup.description}`);
        });

        // Show current settings
        const settings = await sql`SELECT value FROM admin_settings WHERE key = 'site_config'`;
        if (settings.length > 0) {
            console.log('\n⚙️ Current Settings:');
            const config = settings[0].value;
            console.log(`   Site Name: ${config.siteName}`);
            console.log(`   Items Per Page: ${config.itemsPerPage}`);
            console.log(`   Maintenance Mode: ${config.maintenanceMode}`);
            console.log(`   Admin Email: ${config.adminEmail}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTable().then(() => process.exit(0));
