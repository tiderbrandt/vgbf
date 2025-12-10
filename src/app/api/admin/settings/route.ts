import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { 
  getSettings, 
  updateSettings, 
  resetSettings, 
  createBackup, 
  listBackups, 
  restoreFromBackup,
  validateSettings,
  exportAllSettings,
  importSettings,
  deleteBackup,
  cleanupOldBackups,
  getBackupDetails,
  getDisplayConfig,
  updateDisplayConfig,
  getSecurityConfig,
  updateSecurityConfig,
  getBackupConfig,
  updateBackupConfig,
  getAdvancedConfig,
  updateAdvancedConfig
} from '@/lib/settings-storage-postgres'

// GET - Retrieve current settings
export const GET = withAuth(async (request: NextRequest) => {
  const result = await getSettings()
  
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: result.data })
})

// PUT - Update settings
export const PUT = withAuth(async (request: NextRequest) => {
  const body = await request.json()
  
  // Validate settings before updating
  const validationResult = await validateSettings(body)
  if (!validationResult.isValid) {
    return NextResponse.json({ 
      success: false, 
      error: `Validation failed: ${validationResult.errors.join(', ')}` 
    }, { status: 400 })
  }
  
  // Validate required fields
  const requiredFields = ['siteName', 'siteDescription', 'adminEmail', 'itemsPerPage', 'dateFormat', 'enableRegistration', 'enableNotifications', 'backupFrequency', 'maintenanceMode']
  const missingFields = requiredFields.filter(field => !(field in body))
  
  if (missingFields.length > 0) {
    return NextResponse.json({ 
      success: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    }, { status: 400 })
  }

  const result = await updateSettings(body)
  
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: result.data })
})

// POST - Special actions (reset, backup)
export const POST = withAuth(async (request: NextRequest) => {
  const body = await request.json()
  const { action } = body

  if (action === 'reset') {
    const result = await resetSettings()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Settings reset to defaults' })
  }
  
  if (action === 'backup') {
    const result = await createBackup()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Backup created successfully' })
  }
  
  if (action === 'list-backups') {
    const result = await listBackups()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }
  
  if (action === 'restore') {
    const { backupId } = body
    
    if (!backupId) {
      return NextResponse.json({ success: false, error: 'Backup ID is required' }, { status: 400 })
    }
    
    const result = await restoreFromBackup(backupId)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Settings restored from backup' })
  }

  if (action === 'export') {
    const result = await exportAllSettings()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Settings exported successfully' })
  }

  if (action === 'import') {
    const { settingsData } = body
    
    if (!settingsData) {
      return NextResponse.json({ success: false, error: 'Settings data is required' }, { status: 400 })
    }
    
    const result = await importSettings(settingsData)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Settings imported successfully' })
  }

  if (action === 'delete-backup') {
    const { backupId } = body
    
    if (!backupId) {
      return NextResponse.json({ success: false, error: 'Backup ID is required' }, { status: 400 })
    }
    
    const result = await deleteBackup(backupId)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Backup deleted successfully' })
  }

  if (action === 'cleanup-backups') {
    const { retentionDays = 30 } = body
    
    const result = await cleanupOldBackups(retentionDays)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Cleaned up backups older than ${retentionDays} days` })
  }

  if (action === 'get-backup-details') {
    const { backupId } = body
    
    if (!backupId) {
      return NextResponse.json({ success: false, error: 'Backup ID is required' }, { status: 400 })
    }
    
    const result = await getBackupDetails(backupId)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'get-display-config') {
    const result = await getDisplayConfig()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'update-display-config') {
    const { config } = body
    
    if (!config) {
      return NextResponse.json({ success: false, error: 'Config is required' }, { status: 400 })
    }
    
    const result = await updateDisplayConfig(config)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'get-security-config') {
    const result = await getSecurityConfig()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'update-security-config') {
    const { config } = body
    
    if (!config) {
      return NextResponse.json({ success: false, error: 'Config is required' }, { status: 400 })
    }
    
    const result = await updateSecurityConfig(config)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'get-backup-config') {
    const result = await getBackupConfig()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'update-backup-config') {
    const { config } = body
    
    if (!config) {
      return NextResponse.json({ success: false, error: 'Config is required' }, { status: 400 })
    }
    
    const result = await updateBackupConfig(config)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'get-advanced-config') {
    const result = await getAdvancedConfig()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  if (action === 'update-advanced-config') {
    const { config } = body
    
    if (!config) {
      return NextResponse.json({ success: false, error: 'Config is required' }, { status: 400 })
    }
    
    const result = await updateAdvancedConfig(config)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  }

  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
})
