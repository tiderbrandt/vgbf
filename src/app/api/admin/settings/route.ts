import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
import { getSettings, updateSettings, resetSettings, createBackup } from '@/lib/settings-storage-postgres'

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

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
