import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
import { getSettings } from '@/lib/settings-storage-postgres'

export async function GET(request: NextRequest) {
  try {
    console.log('AI Status endpoint called')
    
    // Check if JWT_SECRET is available
    const hasJwtSecret = !!process.env.JWT_SECRET
    console.log('JWT_SECRET available:', hasJwtSecret)
    
    // Verify authentication
    const isAuthenticated = verifyAdminAuth(request)
    if (!isAuthenticated) {
      console.log('Authentication failed in status endpoint')
      return NextResponse.json(
        { success: false, error: 'Unauthorized', debug: { hasJwtSecret } },
        { status: 401 }
      )
    }

    console.log('Authentication successful in status endpoint')

    // Get settings
    const settingsResult = await getSettings()
    console.log('Settings result:', { success: settingsResult.success, error: settingsResult.error })
    
    const status = {
      settingsLoaded: settingsResult.success,
      settingsError: settingsResult.error || null,
      provider: 'huggingface',
      hasHuggingFaceInSettings: !!(settingsResult.data?.huggingfaceApiKey),
      hasHuggingFaceInEnv: !!process.env.HUGGINGFACE_API_KEY,
      hasJwtSecret,
      timestamp: new Date().toISOString()
    }

    console.log('Status response:', status)

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('AI Status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check AI status', details: String(error) },
      { status: 500 }
    )
  }
}
