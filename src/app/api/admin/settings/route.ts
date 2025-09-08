import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'

// This would eventually connect to a database table for settings
// For now, we'll use a simple in-memory storage simulation
const defaultSettings = {
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

// In a real implementation, this would be stored in the database
let currentSettings = { ...defaultSettings }

export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: currentSettings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the settings object
    const allowedFields = [
      'siteName', 'siteDescription', 'adminEmail', 'itemsPerPage', 
      'dateFormat', 'enableRegistration', 'enableNotifications', 
      'backupFrequency', 'maintenanceMode'
    ]
    
    const filteredSettings = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key]
        return obj
      }, {} as any)

    // Update current settings
    currentSettings = { ...currentSettings, ...filteredSettings }

    // In a real implementation, you would save to database here
    console.log('Updated settings:', currentSettings)

    return NextResponse.json({
      success: true,
      data: currentSettings,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'reset':
        currentSettings = { ...defaultSettings }
        return NextResponse.json({
          success: true,
          data: currentSettings,
          message: 'Settings reset to defaults'
        })

      case 'backup':
        // Simulate backup creation
        const backupData = {
          timestamp: new Date().toISOString(),
          settings: currentSettings,
          // In real implementation, would include database backup
        }
        console.log('Backup created:', backupData)
        return NextResponse.json({
          success: true,
          message: 'Backup created successfully',
          data: { backupId: `backup_${Date.now()}` }
        })

      case 'export':
        // Simulate data export
        return NextResponse.json({
          success: true,
          message: 'Data export initiated',
          data: { exportUrl: '/api/admin/export/data.json' }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing settings action:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 })
  }
}
