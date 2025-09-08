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

export interface DisplayConfig {
  language: string
  timezone: string
  enablePublicRegistration: boolean
  showMemberCount: boolean
  enableComments: boolean
}

export interface SecurityConfig {
  sessionTimeout: number
  requireStrongPasswords: boolean
  enableTwoFactor: boolean
  maxLoginAttempts: number
  enableAuditLog: boolean
}

export interface BackupConfig {
  enableAutoBackup: boolean
  backupRetentionDays: number
  lastBackupDate: string | null
  backupLocation: string
}

export interface AdvancedConfig {
  debugMode: boolean
  enableCaching: boolean
  cacheTimeout: number
  enableAnalytics: boolean
  customCss: string
  customJs: string
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

// List all available backups
export async function listBackups(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const result = await sql`
      SELECT key, value, description, created_at
      FROM admin_settings 
      WHERE key LIKE 'backup_%'
      ORDER BY created_at DESC
    `
    
    const backups = result.map((row: any) => ({
      id: row.key,
      data: row.value,
      description: row.description,
      created_at: row.created_at
    }))
    
    return { success: true, data: backups }
  } catch (error) {
    console.error('Error listing backups:', error)
    return { success: false, error: 'Failed to list backups' }
  }
}

// Restore settings from a backup
export async function restoreFromBackup(backupId: string): Promise<SettingsResult> {
  try {
    // Get the backup data
    const backupResult = await sql`
      SELECT value FROM admin_settings WHERE key = ${backupId}
    `
    
    if (backupResult.length === 0) {
      return { success: false, error: 'Backup not found' }
    }
    
    const backupData = backupResult[0].value
    
    // Validate that it's a backup with settings
    if (!backupData.settings) {
      return { success: false, error: 'Invalid backup format' }
    }
    
    // Restore the settings
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(backupData.settings)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'site_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Failed to restore settings' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error restoring from backup:', error)
    return { success: false, error: 'Failed to restore from backup' }
  }
}

// Settings Validation Functions
export async function validateSettings(settings: AdminSettings): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  // Validate required fields
  if (!settings.siteName || settings.siteName.trim().length === 0) {
    errors.push('Site name is required')
  }
  
  if (!settings.siteDescription || settings.siteDescription.trim().length === 0) {
    errors.push('Site description is required')
  }
  
  if (!settings.adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminEmail)) {
    errors.push('Valid admin email is required')
  }
  
  if (!settings.itemsPerPage || settings.itemsPerPage < 1 || settings.itemsPerPage > 100) {
    errors.push('Items per page must be between 1 and 100')
  }
  
  if (!settings.dateFormat || !['sv-SE', 'en-US', 'en-GB'].includes(settings.dateFormat)) {
    errors.push('Valid date format is required')
  }
  
  if (!settings.backupFrequency || !['daily', 'weekly', 'monthly', 'manual'].includes(settings.backupFrequency)) {
    errors.push('Valid backup frequency is required')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Settings Export/Import Functions
export async function exportAllSettings(): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const result = await sql`
      SELECT key, value, description, created_at, updated_at
      FROM admin_settings 
      WHERE key NOT LIKE 'backup_%'
      ORDER BY key
    `
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      settings: result.map((row: any) => ({
        key: row.key,
        value: row.value,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at
      }))
    }
    
    return { success: true, data: JSON.stringify(exportData, null, 2) }
  } catch (error) {
    console.error('Error exporting settings:', error)
    return { success: false, error: 'Failed to export settings' }
  }
}

export async function importSettings(settingsJson: string): Promise<SettingsResult> {
  try {
    const importData = JSON.parse(settingsJson)
    
    if (!importData.settings || !Array.isArray(importData.settings)) {
      return { success: false, error: 'Invalid import format' }
    }
    
    // Create backup before import
    await createBackup()
    
    // Import each setting
    for (const setting of importData.settings) {
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES (${setting.key}, ${JSON.stringify(setting.value)}, ${setting.description})
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `
    }
    
    // Return the main site config
    const mainConfig = await getSettings()
    return mainConfig
  } catch (error) {
    console.error('Error importing settings:', error)
    return { success: false, error: 'Failed to import settings' }
  }
}

// Individual Setting Management
export async function getSingleSetting(key: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = ${key}
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Setting not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting single setting:', error)
    return { success: false, error: 'Failed to retrieve setting' }
  }
}

export async function updateSingleSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(value)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = ${key}
      RETURNING id
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Setting not found' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating single setting:', error)
    return { success: false, error: 'Failed to update setting' }
  }
}

// Extended Configuration Support
export async function getDisplayConfig(): Promise<{ success: boolean; data?: DisplayConfig; error?: string }> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = 'display_config'
    `
    
    if (result.length === 0) {
      // Return default display config
      const defaultConfig: DisplayConfig = {
        language: 'sv',
        timezone: 'Europe/Stockholm',
        enablePublicRegistration: false,
        showMemberCount: true,
        enableComments: false
      }
      
      // Insert default config
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('display_config', ${JSON.stringify(defaultConfig)}, 'Display and UI configuration')
        ON CONFLICT (key) DO NOTHING
      `
      
      return { success: true, data: defaultConfig }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting display config:', error)
    return { success: false, error: 'Failed to retrieve display config' }
  }
}

export async function updateDisplayConfig(config: DisplayConfig): Promise<{ success: boolean; data?: DisplayConfig; error?: string }> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(config)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'display_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Display config not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error updating display config:', error)
    return { success: false, error: 'Failed to update display config' }
  }
}

export async function getSecurityConfig(): Promise<{ success: boolean; data?: SecurityConfig; error?: string }> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = 'security_config'
    `
    
    if (result.length === 0) {
      // Return default security config
      const defaultConfig: SecurityConfig = {
        sessionTimeout: 3600,
        requireStrongPasswords: true,
        enableTwoFactor: false,
        maxLoginAttempts: 5,
        enableAuditLog: true
      }
      
      // Insert default config
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('security_config', ${JSON.stringify(defaultConfig)}, 'Security and authentication settings')
        ON CONFLICT (key) DO NOTHING
      `
      
      return { success: true, data: defaultConfig }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting security config:', error)
    return { success: false, error: 'Failed to retrieve security config' }
  }
}

export async function updateSecurityConfig(config: SecurityConfig): Promise<{ success: boolean; data?: SecurityConfig; error?: string }> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(config)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'security_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Security config not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error updating security config:', error)
    return { success: false, error: 'Failed to update security config' }
  }
}

export async function getBackupConfig(): Promise<{ success: boolean; data?: BackupConfig; error?: string }> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = 'backup_config'
    `
    
    if (result.length === 0) {
      // Return default backup config
      const defaultConfig: BackupConfig = {
        enableAutoBackup: true,
        backupRetentionDays: 30,
        lastBackupDate: null,
        backupLocation: 'local'
      }
      
      // Insert default config
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('backup_config', ${JSON.stringify(defaultConfig)}, 'Backup and recovery settings')
        ON CONFLICT (key) DO NOTHING
      `
      
      return { success: true, data: defaultConfig }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting backup config:', error)
    return { success: false, error: 'Failed to retrieve backup config' }
  }
}

export async function updateBackupConfig(config: BackupConfig): Promise<{ success: boolean; data?: BackupConfig; error?: string }> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(config)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'backup_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Backup config not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error updating backup config:', error)
    return { success: false, error: 'Failed to update backup config' }
  }
}

export async function getAdvancedConfig(): Promise<{ success: boolean; data?: AdvancedConfig; error?: string }> {
  try {
    const result = await sql`
      SELECT value FROM admin_settings WHERE key = 'advanced_config'
    `
    
    if (result.length === 0) {
      // Return default advanced config
      const defaultConfig: AdvancedConfig = {
        debugMode: false,
        enableCaching: true,
        cacheTimeout: 300,
        enableAnalytics: false,
        customCss: '',
        customJs: ''
      }
      
      // Insert default config
      await sql`
        INSERT INTO admin_settings (key, value, description)
        VALUES ('advanced_config', ${JSON.stringify(defaultConfig)}, 'Advanced system configuration')
        ON CONFLICT (key) DO NOTHING
      `
      
      return { success: true, data: defaultConfig }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error getting advanced config:', error)
    return { success: false, error: 'Failed to retrieve advanced config' }
  }
}

export async function updateAdvancedConfig(config: AdvancedConfig): Promise<{ success: boolean; data?: AdvancedConfig; error?: string }> {
  try {
    const result = await sql`
      UPDATE admin_settings 
      SET value = ${JSON.stringify(config)}, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'advanced_config'
      RETURNING value
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Advanced config not found' }
    }
    
    return { success: true, data: result[0].value }
  } catch (error) {
    console.error('Error updating advanced config:', error)
    return { success: false, error: 'Failed to update advanced config' }
  }
}

// Enhanced Backup Management
export async function deleteBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!backupId.startsWith('backup_')) {
      return { success: false, error: 'Invalid backup ID' }
    }
    
    const result = await sql`
      DELETE FROM admin_settings WHERE key = ${backupId}
      RETURNING id
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Backup not found' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting backup:', error)
    return { success: false, error: 'Failed to delete backup' }
  }
}

export async function cleanupOldBackups(retentionDays: number): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const result = await sql`
      DELETE FROM admin_settings 
      WHERE key LIKE 'backup_%' 
        AND created_at < ${cutoffDate.toISOString()}
      RETURNING id
    `
    
    return { success: true, deletedCount: result.length }
  } catch (error) {
    console.error('Error cleaning up old backups:', error)
    return { success: false, error: 'Failed to cleanup old backups' }
  }
}

export async function getBackupDetails(backupId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!backupId.startsWith('backup_')) {
      return { success: false, error: 'Invalid backup ID' }
    }
    
    const result = await sql`
      SELECT key, value, description, created_at
      FROM admin_settings 
      WHERE key = ${backupId}
    `
    
    if (result.length === 0) {
      return { success: false, error: 'Backup not found' }
    }
    
    const backup = result[0]
    return { 
      success: true, 
      data: {
        id: backup.key,
        backupData: backup.value,
        description: backup.description,
        created_at: backup.created_at,
        size: JSON.stringify(backup.value).length
      }
    }
  } catch (error) {
    console.error('Error getting backup details:', error)
    return { success: false, error: 'Failed to get backup details' }
  }
}

// Settings History/Audit
export async function getSettingsHistory(limit: number = 50): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const result = await sql`
      SELECT key, value, description, created_at, updated_at
      FROM admin_settings 
      WHERE key NOT LIKE 'backup_%'
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `
    
    const history = result.map((row: any) => ({
      key: row.key,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
      valueSize: JSON.stringify(row.value).length
    }))
    
    return { success: true, data: history }
  } catch (error) {
    console.error('Error getting settings history:', error)
    return { success: false, error: 'Failed to get settings history' }
  }
}

export async function logSettingsChange(key: string, oldValue: any, newValue: any, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      key,
      oldValue,
      newValue,
      userId: userId || 'unknown',
      action: 'update'
    }
    
    await sql`
      INSERT INTO admin_settings (key, value, description)
      VALUES (
        ${'audit_' + Date.now()}, 
        ${JSON.stringify(logEntry)}, 
        ${'Settings change audit log for ' + key}
      )
    `
    
    return { success: true }
  } catch (error) {
    console.error('Error logging settings change:', error)
    return { success: false, error: 'Failed to log settings change' }
  }
}
