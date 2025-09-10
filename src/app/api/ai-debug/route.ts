import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings-storage-postgres'

export async function GET(request: NextRequest) {
  try {
    console.log('AI Debug endpoint called')
    
    // Get settings
    const settingsResult = await getSettings()
    
    const debug = {
      settingsLoaded: settingsResult.success,
      settingsError: settingsResult.error || null,
      rawSettings: settingsResult.data,
      provider: settingsResult.data?.aiImageProvider || 'openai',
      hasOpenAIInSettings: !!(settingsResult.data?.openaiApiKey),
      hasGeminiInSettings: !!(settingsResult.data?.geminiApiKey),
      hasOpenAIInEnv: !!process.env.OPENAI_API_KEY,
      hasGeminiInEnv: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    }

    console.log('AI Debug response:', debug)

    return NextResponse.json({
      success: true,
      data: debug
    })
  } catch (error) {
    console.error('AI Debug check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check AI debug info', details: String(error) },
      { status: 500 }
    )
  }
}
