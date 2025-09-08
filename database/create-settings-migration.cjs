// Load environment variables manually
const fs = require('fs');
const path = require('path');

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !key.startsWith('#')) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Disable SSL verification for development (like the app does)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { neon } = require('@neondatabase/serverless');

async function createSettingsTable() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Creating admin_settings table...');

    try {
        // Create the table
        await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Create index
        await sql`
      CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key)
    `;

        // Create trigger function
        await sql`
      CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

        // Create trigger
        await sql`
      CREATE OR REPLACE TRIGGER update_admin_settings_updated_at
        BEFORE UPDATE ON admin_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_admin_settings_updated_at()
    `;

        // Insert default settings
        const siteConfig = {
            siteName: "Västra Götalands Bågskytteförbund",
            siteDescription: "Officiell webbplats för Västra Götalands Bågskytteförbund",
            adminEmail: "admin@vgbf.se",
            itemsPerPage: 10,
            dateFormat: "sv-SE",
            enableRegistration: false,
            enableNotifications: true,
            backupFrequency: "weekly",
            maintenanceMode: false
        };

        await sql`
      INSERT INTO admin_settings (key, value, description) VALUES
      ('site_config', ${JSON.stringify(siteConfig)}, 'Main site configuration settings')
      ON CONFLICT (key) DO NOTHING
    `;

        console.log('✅ admin_settings table created successfully with default data!');

        // Verify the data was inserted
        const result = await sql`SELECT * FROM admin_settings WHERE key = 'site_config'`;
        console.log('✅ Verified settings data:', result[0]?.value);

    } catch (error) {
        console.error('❌ Error creating settings table:', error);
        throw error;
    }
}

// Run the migration
createSettingsTable()
    .then(() => {
        console.log('Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
