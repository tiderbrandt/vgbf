import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
import { getSettings } from '@/lib/settings-storage-postgres'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get settings
    const settingsResult = await getSettings()
    
    const status = {
      settingsLoaded: settingsResult.success,
      settingsError: settingsResult.error || null,
      provider: settingsResult.data?.aiImageProvider || 'openai',
      hasOpenAIInSettings: !!(settingsResult.data?.openaiApiKey),
      hasGeminiInSettings: !!(settingsResult.data?.geminiApiKey),
      hasOpenAIInEnv: !!process.env.OPENAI_API_KEY,
      hasGeminiInEnv: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    }

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
