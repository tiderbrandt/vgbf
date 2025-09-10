import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/settings-storage-postgres'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting settings migration...')
    
    // Get current settings
    const settingsResult = await getSettings()
    if (!settingsResult.success || !settingsResult.data) {
      throw new Error('Failed to get current settings')
    }
    const currentSettings = settingsResult.data
    console.log('Current settings keys:', Object.keys(currentSettings))
    
    // Check if migration is needed
    const hasOldKeys = 'geminiApiKey' in currentSettings || 'openaiApiKey' in currentSettings
    const hasNewKey = 'huggingfaceApiKey' in currentSettings
    
    if (!hasOldKeys && hasNewKey) {
      return NextResponse.json({
        success: true,
        message: 'Settings already migrated',
        currentSettings: Object.keys(currentSettings)
      })
    }
    
    if (hasOldKeys && !hasNewKey) {
      console.log('Migration needed: has old keys but no new key')
      
      // For now, just remove old keys - user will need to add HF key manually
      const migratedSettings = {
        ...currentSettings,
        aiImageProvider: 'huggingface'
      }
      
      // Remove old keys
      delete (migratedSettings as any).geminiApiKey
      delete (migratedSettings as any).openaiApiKey
      
      await updateSettings(migratedSettings)
      
      return NextResponse.json({
        success: true,
        message: 'Settings migrated successfully. Please add your Hugging Face token.',
        migratedFrom: hasOldKeys ? 'old format' : 'new format',
        currentProvider: 'huggingface',
        needsHuggingFaceKey: true
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'No migration needed',
      currentSettings: Object.keys(currentSettings)
    })
    
  } catch (error) {
    console.error('Settings migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
