import { sql } from '../src/lib/database.ts'

async function createSettingsTable() {
    console.log('Creating admin_settings table...')

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
    `

        // Create index
        await sql`
      CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key)
    `

        // Create trigger function
        await sql`
      CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

        // Create trigger
        await sql`
      CREATE OR REPLACE TRIGGER update_admin_settings_updated_at
        BEFORE UPDATE ON admin_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_admin_settings_updated_at()
    `

        // Insert default settings
        await sql`
      INSERT INTO admin_settings (key, value, description) VALUES
      ('site_config', ${JSON.stringify({
            siteName: "Västra Götalands Bågskytteförbund",
            siteDescription: "Officiell webbplats för Västra Götalands Bågskytteförbund",
            adminEmail: "admin@vgbf.se",
            itemsPerPage: 10,
            dateFormat: "sv-SE",
            enableRegistration: false,
            enableNotifications: true,
            backupFrequency: "weekly",
            maintenanceMode: false
        })}, 'Main site configuration settings'),
      
      ('display_config', ${JSON.stringify({
            language: "sv",
            timezone: "Europe/Stockholm",
            enablePublicRegistration: false,
            showMemberCount: true,
            enableComments: false
        })}, 'Display and UI configuration'),
      
      ('security_config', ${JSON.stringify({
            sessionTimeout: 3600,
            requireStrongPasswords: true,
            enableTwoFactor: false,
            maxLoginAttempts: 5,
            enableAuditLog: true
        })}, 'Security and authentication settings'),
      
      ('backup_config', ${JSON.stringify({
            enableAutoBackup: true,
            backupRetentionDays: 30,
            lastBackupDate: null,
            backupLocation: "local"
        })}, 'Backup and recovery settings'),
      
      ('advanced_config', ${JSON.stringify({
            debugMode: false,
            enableCaching: true,
            cacheTimeout: 300,
            enableAnalytics: false,
            customCss: "",
            customJs: ""
        })}, 'Advanced system configuration')
      
      ON CONFLICT (key) DO NOTHING
    `

        console.log('✅ admin_settings table created successfully with default data!')

    } catch (error) {
        console.error('❌ Error creating settings table:', error)
        throw error
    }
}

// Run the migration
createSettingsTable()
    .then(() => {
        console.log('Migration completed successfully!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Migration failed:', error)
        process.exit(1)
    })
