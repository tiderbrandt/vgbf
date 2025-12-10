import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings-storage-postgres'
import { withAuth } from '@/lib/api/withAuth'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export const GET = withAuth(async (request: NextRequest) => {
  console.log('AI Status endpoint called')
  
  // Check if JWT_SECRET is available
  const hasJwtSecret = !!process.env.JWT_SECRET
  console.log('JWT_SECRET available:', hasJwtSecret)
  
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
})
