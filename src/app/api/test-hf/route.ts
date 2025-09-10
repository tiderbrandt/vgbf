import { NextRequest, NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings-storage-postgres'

export async function GET() {
  try {
    console.log('Testing Hugging Face API integration...')
    
    // Get settings
    const settingsResult = await getSettings()
    if (!settingsResult.success || !settingsResult.data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to load settings',
        details: settingsResult.error 
      })
    }

    const settings = settingsResult.data
    
    // Check for Hugging Face API key
    const huggingfaceApiKey = settings.huggingfaceApiKey || process.env.HUGGINGFACE_API_KEY
    
    if (!huggingfaceApiKey) {
      return NextResponse.json({
        success: false,
        error: 'No Hugging Face API key found',
        debug: {
          hasSettingsKey: !!settings.huggingfaceApiKey,
          hasEnvKey: !!process.env.HUGGINGFACE_API_KEY,
          availableSettingsKeys: Object.keys(settings)
        }
      })
    }

    // Test the API with a simple prompt
    console.log('Calling Hugging Face API...')
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingfaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'a simple test image of a cat',
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        })
      }
    )

    console.log('HF API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('HF API Error:', errorText)
      return NextResponse.json({
        success: false,
        error: 'Hugging Face API call failed',
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        }
      })
    }

    // For testing, we don't need to process the actual image
    const contentType = response.headers.get('content-type')
    console.log('HF API Success! Content-Type:', contentType)
    
    return NextResponse.json({
      success: true,
      message: 'Hugging Face API test successful!',
      details: {
        responseStatus: response.status,
        contentType: contentType,
        hasApiKey: true,
        keySource: settings.huggingfaceApiKey ? 'settings' : 'environment'
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
