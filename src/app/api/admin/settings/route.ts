import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
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
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getSettings()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

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
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Special actions (reset, backup)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

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

      return NextResponse.json({ 
        success: true, 
        message: `Cleanup completed. Deleted ${result.deletedCount} old backups.` 
      })
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
        return NextResponse.json({ success: false, error: 'Display config is required' }, { status: 400 })
      }
      
      const result = await updateDisplayConfig(config)
      
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: result.data, message: 'Display config updated successfully' })
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
        return NextResponse.json({ success: false, error: 'Security config is required' }, { status: 400 })
      }
      
      const result = await updateSecurityConfig(config)
      
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: result.data, message: 'Security config updated successfully' })
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
        return NextResponse.json({ success: false, error: 'Backup config is required' }, { status: 400 })
      }
      
      const result = await updateBackupConfig(config)
      
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: result.data, message: 'Backup config updated successfully' })
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
        return NextResponse.json({ success: false, error: 'Advanced config is required' }, { status: 400 })
      }
      
      const result = await updateAdvancedConfig(config)
      
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: result.data, message: 'Advanced config updated successfully' })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
