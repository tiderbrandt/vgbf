import { sql } from './database'

export interface AdminSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  itemsPerPage: number
  dateFormat: string
  enableRegistration: boolean
  enableNotifications: boolean
  backupFrequency: string
  maintenanceMode: boolean
}

export interface SettingsResult {
  success: boolean
  data?: AdminSettings
  error?: string
}

// Get all settings from the database
export async function getSettings(): Promise<SettingsResult> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = 'site_config'
    `
    
    if (result.length === 0) {
      // Return default settings if none exist
      const defaultSettings: AdminSettings = {
        siteName: 'Västra Götalands Bågskytteförbund',
        siteDescription: 'Officiell webbplats för Västra Götalands Bågskytteförbund',
        adminEmail: 'admin@vgbf.se',
        itemsPerPage: 10,
        dateFormat: 'sv-SE',
        enableRegistration: false,
        enableNotifications: true,
        backupFrequency: 'weekly',
        maintenanceMode: false
      }
      
      // Insert default settings
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('site_config', ${JSON.stringify(defaultSettings)}, 'Main site configuration settings')
        ON CONFLICT (key) DO NOTHING
      `
      
      return { success: true, data: defaultSettings }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting settings:', error)
    return { success: false, error: 'Failed to retrieve settings' }
  }
}

// Update settings in the database
export async function updateSettings(settings: AdminSettings): Promise<SettingsResult> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(settings)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'site_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Settings not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}

// Reset settings to defaults
export async function resetSettings(): Promise<SettingsResult> {
  try {
    const defaultSettings: AdminSettings = {
      siteName: 'Västra Götalands Bågskytteförbund',
      siteDescription: 'Officiell webbplats för Västra Götalands Bågskytteförbund',
      adminEmail: 'admin@vgbf.se',
      itemsPerPage: 10,
      dateFormat: 'sv-SE',
      enableRegistration: false,
      enableNotifications: true,
      backupFrequency: 'weekly',
      maintenanceMode: false
    }
    
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(defaultSettings)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'site_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      // Insert if doesn't exist
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('site_config', ${JSON.stringify(defaultSettings)}, 'Main site configuration settings')
      `
      return { success: true, data: defaultSettings }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error resetting settings:', error)
    return { success: false, error: 'Failed to reset settings' }
  }
}

// Create a backup of current settings
export async function createBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current settings
    const settingsResult = await getSettings()
    if (!settingsResult.success || !settingsResult.data) {
      return { success: false, error: 'Failed to get current settings for backup' }
    }
    
    // Create backup entry with timestamp
    const backupData = {
      settings: settingsResult.data,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    await sql`
      INSERT INTO admin_settings (key, value, description)
      VALUES (
        ${'backup_' + Date.now()}, 
        ${JSON.stringify(backupData)}, 
        ${'Settings backup created on ' + new Date().toLocaleString('sv-SE')}
      )
    `
    
    // Update last backup date in backup config
    await sql`
      UPDATE admin_settings 
      SET value = jsonb_set(value, '{lastBackupDate}', ${JSON.stringify(new Date().toISOString())})
      WHERE key = 'backup_config'
    `
    
    return { success: true }
  } catch (error) {
    console.error('Error creating backup:', error)
    return { success: false, error: 'Failed to create backup' }
  }
}
